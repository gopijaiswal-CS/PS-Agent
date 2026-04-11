import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum QuestionTrack {
  HLD = 'hld',
  LLD = 'lld',
  DSA = 'dsa',
  AI_ML = 'ai-ml',
  BEHAVIORAL = 'behavioral',
}

export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  MEDIUM_HARD = 3,
  HARD = 4,
  EXPERT = 5,
}

@Schema({ _id: false })
class RubricDimension {
  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  description: string;
}

@Schema({ _id: false })
class Rubric {
  @Prop({ type: RubricDimension })
  scalability: RubricDimension;

  @Prop({ type: RubricDimension })
  correctness: RubricDimension;

  @Prop({ type: RubricDimension })
  completeness: RubricDimension;

  @Prop({ type: RubricDimension })
  clarity: RubricDimension;
}

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: QuestionTrack })
  track: QuestionTrack;

  @Prop({ required: true, min: 1, max: 5 })
  difficulty: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Topic' }] })
  topics: Types.ObjectId[];

  @Prop({ type: Rubric })
  rubric: Rubric;

  @Prop({ type: [String], default: [] })
  hints: string[];

  @Prop({ default: 2400 })
  timeLimitSeconds: number;

  @Prop()
  sampleAnswerOutline: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  attemptCount: number;

  @Prop({ default: 0 })
  avgScore: number;
}

export type QuestionDocument = Question & Document;
export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ track: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ isPublished: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ title: 'text', description: 'text' });
