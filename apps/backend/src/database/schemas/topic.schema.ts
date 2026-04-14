import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionTrack } from './question.schema';

@Schema({ timestamps: true })
export class Topic {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: QuestionTrack })
  track: QuestionTrack;

  @Prop({ type: Object, required: true })
  content: Record<string, any>;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Topic' }], default: [] })
  prerequisites: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Topic' }], default: [] })
  nextTopics: Types.ObjectId[];

  @Prop({ default: 0 })
  order: number;

  @Prop()
  estimatedReadMinutes: number;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'LIVE'], default: 'DRAFT' })
  status: string;

  @Prop()
  reviewNotes: string;
}

export type TopicDocument = Topic & Document;
export const TopicSchema = SchemaFactory.createForClass(Topic);

TopicSchema.index({ track: 1 });
TopicSchema.index({ category: 1 });
TopicSchema.index({ status: 1 });
