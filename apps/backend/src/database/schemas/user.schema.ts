import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  CONTENT_ADMIN = 'content-admin',
  PRO = 'pro',
  FREE = 'free',
}

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  supabaseId: string;

  @Prop({ default: UserRole.FREE, enum: UserRole })
  role: UserRole;

  @Prop({ default: UserPlan.FREE, enum: UserPlan })
  plan: UserPlan;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ type: Object, default: {} })
  weaknessMap: Record<string, number>;

  @Prop({ default: 0 })
  sessionCount: number;

  @Prop({ default: 0 })
  questionsAttempted: number;

  @Prop({ type: [String], default: [] })
  completedQuestionIds: string[];

  @Prop()
  refreshToken: string;

  @Prop()
  lastActiveAt: Date;

  @Prop()
  password: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ supabaseId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
