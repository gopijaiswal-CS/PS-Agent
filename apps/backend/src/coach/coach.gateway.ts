import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { CoachService } from './coach.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/coach',
})
export class CoachGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CoachGateway.name);

  constructor(private readonly coachService: CoachService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Coach client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Coach client disconnected: ${client.id}`);
  }

  // Emotion update (every 3s from MediaPipe — debounced on client)
  @SubscribeMessage('coach:emotion')
  async handleEmotion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; emotion: string; confidence: number; eyeContact: number },
  ) {
    try {
      await this.coachService.appendEmotionSnapshot(
        data.sessionId,
        data.emotion,
        data.confidence,
        data.eyeContact,
      );
    } catch (err) {
      this.logger.error('Emotion update error', err);
    }
  }

  // Transcript update (accumulated full transcript from frontend Zustand store)
  @SubscribeMessage('coach:transcript')
  async handleTranscript(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; fullTranscript: string; avgWPM?: number; hesitationCount?: number },
  ) {
    try {
      await this.coachService.appendTranscript(data.sessionId, data.fullTranscript);
      if (data.avgWPM !== undefined) {
        await this.coachService.updateVoiceAnalytics(
          data.sessionId,
          data.avgWPM,
          data.hesitationCount || 0,
        );
      }
    } catch (err) {
      this.logger.error('Transcript update error', err);
    }
  }

  // User sends a message to the coach — streams Claude response back
  @SubscribeMessage('coach:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      sessionId: string;
      text: string;
      emotion?: { current: string; confidence: number };
      eyeContact?: number;
      avgWPM?: number;
      hesitationCount?: number;
      diagramJSON?: object;
    },
  ) {
    try {
      const stream = await this.coachService.streamCoachResponse(data.sessionId, data.text, {
        emotion: data.emotion || { current: 'neutral', confidence: 0.5 },
        eyeContact: data.eyeContact || 0.5,
        avgWPM: data.avgWPM || 130,
        hesitationCount: data.hesitationCount || 0,
        diagramJSON: data.diagramJSON,
      });

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        client.emit('coach:chunk', { text: chunk });
      }
      client.emit('coach:done', { fullText });
    } catch (err) {
      this.logger.error('Coach message error', err);
      client.emit('coach:error', { error: 'Failed to get coach response' });
    }
  }

  // End session event  
  @SubscribeMessage('coach:end')
  async handleEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; userId: string },
  ) {
    try {
      const result = await this.coachService.endSession(data.sessionId, data.userId);
      client.emit('coach:session-ended', result);
    } catch (err) {
      this.logger.error('End session error', err);
      client.emit('coach:error', { error: 'Failed to end session' });
    }
  }
}
