import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class StartCoachSessionDto {
  @IsString()
  questionId: string;

  @IsString()
  @IsOptional()
  coachPersona?: string;
}

export class EmotionUpdateDto {
  @IsString()
  sessionId: string;

  @IsString()
  emotion: string;

  @IsNumber()
  confidence: number;

  @IsNumber()
  eyeContact: number;
}

export class TranscriptChunkDto {
  @IsString()
  sessionId: string;

  @IsString()
  chunk: string;

  @IsOptional()
  isFinal?: boolean;
}

export class CoachMessageDto {
  @IsString()
  sessionId: string;

  @IsString()
  text: string;

  @IsObject()
  @IsOptional()
  emotion?: { current: string; confidence: number };

  @IsNumber()
  @IsOptional()
  eyeContact?: number;

  @IsNumber()
  @IsOptional()
  avgWPM?: number;

  @IsNumber()
  @IsOptional()
  hesitationCount?: number;

  @IsObject()
  @IsOptional()
  diagramJSON?: object;
}
