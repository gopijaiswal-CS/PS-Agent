import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import { OnboardingProfileDto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async saveProfile(userId: string, dto: OnboardingProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found in mapping (please re-login)');

    // Update profile fields
    if (dto.name) user.name = dto.name;
    if (dto.currentRole !== undefined) (user as any).currentRole = dto.currentRole;
    if (dto.yearsExperience !== undefined) (user as any).yearsExperience = dto.yearsExperience;
    if (dto.companyType !== undefined) (user as any).companyType = dto.companyType;
    if (dto.targetRole !== undefined) (user as any).targetRole = dto.targetRole;
    if (dto.targetCompanies !== undefined) (user as any).targetCompanies = dto.targetCompanies;
    if (dto.timeline !== undefined) (user as any).timeline = dto.timeline;
    if (dto.coachPersona !== undefined) (user as any).coachPersona = dto.coachPersona;
    if (dto.feedbackStyle !== undefined) (user as any).feedbackStyle = dto.feedbackStyle;

    // Seed weaknessMap from self-assessment scores
    if (dto.selfAssessment) {
      const weaknessMap: Record<string, number> = {};
      Object.entries(dto.selfAssessment).forEach(([track, score]) => {
        // Invert: lower self-assessment = higher weakness score
        weaknessMap[track] = Math.max(0, 10 - score);
      });
      user.weaknessMap = { ...user.weaknessMap, ...weaknessMap };
    }

    (user as any).onboardingComplete = true;
    await user.save();

    const { password, refreshToken, ...sanitized } = (user.toObject() as any);
    return sanitized;
  }

  async getStatus(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new UnauthorizedException('User not found in mapping (please re-login)');

    return {
      isComplete: (user as any).onboardingComplete || false,
      profile: {
        name: user.name,
        currentRole: (user as any).currentRole || '',
        yearsExperience: (user as any).yearsExperience || 0,
        companyType: (user as any).companyType || 'product',
        targetRole: (user as any).targetRole || '',
        targetCompanies: (user as any).targetCompanies || [],
        timeline: (user as any).timeline || '',
        coachPersona: (user as any).coachPersona || 'marcus',
        feedbackStyle: (user as any).feedbackStyle || 'socratic',
        weaknessMap: user.weaknessMap || {},
      },
    };
  }
}
