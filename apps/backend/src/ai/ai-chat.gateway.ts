import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AiTutorService } from './ai-tutor.service';
import { SessionsService } from '../sessions/sessions.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class AiChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AiChatGateway.name);

  constructor(
    private aiTutorService: AiTutorService,
    private sessionsService: SessionsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @MessageBody() data: { sessionId: string; message: string; diagramJSON?: object },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = await this.sessionsService.findById(data.sessionId, '').catch(() => null);
      
      const question = (session as any)?.questionId || {};
      
      // Save user message to session
      if (session) {
        await this.sessionsService.addChatMessage(data.sessionId, 'user', data.message);
      }

      let fullResponse = '';
      
      const stream = this.aiTutorService.streamChat({
        questionTitle: question.title || 'System Design',
        track: question.track || 'hld',
        difficulty: question.difficulty || 3,
        diagramSummary: data.diagramJSON ? JSON.stringify(data.diagramJSON).slice(0, 1000) : '',
        transcript: (session as any)?.voiceTranscript || '',
        chatHistory: (session as any)?.chatHistory || [],
        userMessage: data.message,
      });

      for await (const chunk of stream) {
        fullResponse += chunk;
        client.emit('chat:chunk', { chunk });
      }

      // Save assistant message
      if (session) {
        await this.sessionsService.addChatMessage(data.sessionId, 'assistant', fullResponse);
      }

      client.emit('chat:done', { fullResponse });
    } catch (error) {
      this.logger.error('Chat error', error);
      client.emit('chat:error', { error: 'Failed to process message' });
    }
  }

  @SubscribeMessage('chat:stop')
  handleChatStop(@ConnectedSocket() client: Socket) {
    this.logger.log(`Chat stopped by client: ${client.id}`);
  }
}
