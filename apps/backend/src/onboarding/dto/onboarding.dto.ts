import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsObject } from 'class-validator';

export class OnboardingProfileDto {
  // Step 1 — Who you are
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  currentRole?: string;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsEnum(['startup', 'enterprise', 'product', 'agency'])
  @IsOptional()
  companyType?: string;

  // Step 2 — Your goal
  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsArray()
  @IsOptional()
  targetCompanies?: string[];

  @IsString()
  @IsOptional()
  timeline?: string;

  // Step 3 — Self-assessment scores (weakness map)
  @IsObject()
  @IsOptional()
  selfAssessment?: Record<string, number>;

  // Step 4 — Choose coach
  @IsString()
  @IsOptional()
  coachPersona?: string;

  @IsEnum(['direct', 'encouraging', 'socratic'])
  @IsOptional()
  feedbackStyle?: string;
}
