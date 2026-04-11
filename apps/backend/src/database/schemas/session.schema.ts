import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class AiRating {
  @Prop() scalability: number;
  @Prop() correctness: number;
  @Prop() completeness: number;
  @Prop() clarity: number;
  @Prop() overall: number;
  @Prop({ type: [String] }) strengths: string[];
  @Prop({ type: [String] }) improvements: string[];
  @Prop() nextSteps: string;
  @Prop() voiceScore: number;
}

@Schema({ _id: false })
class ChatMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: () => new Date().toISOString() })
  timestamp: string;
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  diagramJSON: Record<string, any>;

  @Prop({ default: '' })
  voiceTranscript: string;

  @Prop({ type: AiRating, default: null })
  aiRating: AiRating | null;

  @Prop({ default: 0, min: 0, max: 3 })
  hintsUsed: number;

  @Prop({ default: 0 })
  timeTakenSeconds: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: [ChatMessage], default: [] })
  chatHistory: ChatMessage[];
}

export type SessionDocument = Session & Document;
export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ userId: 1 });
SessionSchema.index({ questionId: 1 });
SessionSchema.index({ userId: 1, questionId: 1 });
SessionSchema.index({ createdAt: -1 });
