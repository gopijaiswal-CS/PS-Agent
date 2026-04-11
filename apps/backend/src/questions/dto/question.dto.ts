import { IsString, IsEnum, IsNumber, Min, Max, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { QuestionTrack } from '../../database/schemas/question.schema';

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(QuestionTrack)
  track: QuestionTrack;

  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsArray()
  @IsOptional()
  topicIds?: string[];

  @IsOptional()
  rubric?: {
    scalability: { weight: number; description: string };
    correctness: { weight: number; description: string };
    completeness: { weight: number; description: string };
    clarity: { weight: number; description: string };
  };

  @IsArray()
  @IsOptional()
  hints?: string[];

  @IsNumber()
  @IsOptional()
  timeLimitSeconds?: number;

  @IsString()
  @IsOptional()
  sampleAnswerOutline?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(QuestionTrack)
  @IsOptional()
  track?: QuestionTrack;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number;

  @IsArray()
  @IsOptional()
  topicIds?: string[];

  @IsOptional()
  rubric?: any;

  @IsArray()
  @IsOptional()
  hints?: string[];

  @IsNumber()
  @IsOptional()
  timeLimitSeconds?: number;

  @IsString()
  @IsOptional()
  sampleAnswerOutline?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class QueryQuestionsDto {
  @IsEnum(QuestionTrack)
  @IsOptional()
  track?: QuestionTrack;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
