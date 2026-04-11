import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { QuestionTrack } from '../../database/schemas/question.schema';

export class CreateTopicDto {
  @IsString() name: string;
  @IsString() category: string;
  @IsEnum(QuestionTrack) track: QuestionTrack;
  @IsOptional() content?: Record<string, any>;
  @IsArray() @IsOptional() images?: string[];
  @IsArray() @IsOptional() prerequisiteIds?: string[];
  @IsArray() @IsOptional() nextTopicIds?: string[];
  @IsNumber() @IsOptional() order?: number;
  @IsNumber() @IsOptional() estimatedReadMinutes?: number;
  @IsBoolean() @IsOptional() isPublished?: boolean;
}

export class UpdateTopicDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() category?: string;
  @IsEnum(QuestionTrack) @IsOptional() track?: QuestionTrack;
  @IsOptional() content?: Record<string, any>;
  @IsArray() @IsOptional() images?: string[];
  @IsArray() @IsOptional() prerequisiteIds?: string[];
  @IsArray() @IsOptional() nextTopicIds?: string[];
  @IsNumber() @IsOptional() order?: number;
  @IsNumber() @IsOptional() estimatedReadMinutes?: number;
  @IsBoolean() @IsOptional() isPublished?: boolean;
}

export class QueryTopicsDto {
  @IsEnum(QuestionTrack) @IsOptional() track?: QuestionTrack;
  @IsString() @IsOptional() category?: string;
  @IsNumber() @IsOptional() page?: number;
  @IsNumber() @IsOptional() limit?: number;
}
