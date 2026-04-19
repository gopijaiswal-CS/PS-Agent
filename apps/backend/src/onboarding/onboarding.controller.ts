import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingProfileDto } from './dto/onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('profile')
  async saveProfile(@Body() dto: OnboardingProfileDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.onboardingService.saveProfile(userId, dto);
  }

  @Get('status')
  async getStatus(@Req() req: any) {
    const userId = req.user?.userId;
    return this.onboardingService.getStatus(userId);
  }
}
