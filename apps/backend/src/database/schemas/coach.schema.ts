import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CoachSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true, enum: ['priya', 'marcus', 'aisha', 'ryan'], default: 'marcus' })
  coachPersona: string;

  // Real-time signals (updated during session)
  @Prop({ default: '' })
  fullTranscript: string;

  @Prop({ type: Object, default: {} })
  diagramJSON: Record<string, any>;

  @Prop({ default: 0 })
  hintsUsed: number;

  @Prop({ default: 0 })
  sessionDurationSeconds: number;

  // Emotion timeline (snapshot every 3s)
  @Prop({ type: [Object], default: [] })
  emotionTimeline: {
    timestamp: number;
    emotion: string;
    confidence: number;
    eyeContact: number;
  }[];

  // Voice analytics
  @Prop({ default: 0 })
  avgWPM: number;

  @Prop({ default: 0 })
  hesitationCount: number;

  @Prop({ default: 0 })
  fillerWordCount: number;

  // Final scores (computed async on session end)
  @Prop({ type: Object, default: null })
  scores: {
    technical: number;
    communication: number;
    confidence: number;
    eyeContact: number;
    paceClarity: number;
    overall: number;
  } | null;

  @Prop({ type: Object, default: null })
  aiFeedback: {
    strengths: string[];
    improvements: string[];
    coachQuote: string;
    nextTopicSlug: string;
  } | null;

  @Prop({ type: String, default: null })
  recordingUrl: string | null;

  @Prop({ default: false })
  isCompleted: boolean;
}

export type CoachSessionDocument = CoachSession & Document;
export const CoachSessionSchema = SchemaFactory.createForClass(CoachSession);

CoachSessionSchema.index({ userId: 1 });
CoachSessionSchema.index({ questionId: 1 });
CoachSessionSchema.index({ coachPersona: 1 });
CoachSessionSchema.index({ createdAt: -1 });
CoachSessionSchema.index({ isCompleted: 1 });
