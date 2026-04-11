import { Module } from '@nestjs/common';
import { AiTutorService } from './ai-tutor.service';
import { AiRatingService } from './ai-rating.service';
import { AiHintService } from './ai-hint.service';
import { AiChatGateway } from './ai-chat.gateway';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  providers: [AiTutorService, AiRatingService, AiHintService, AiChatGateway],
  exports: [AiTutorService, AiRatingService, AiHintService],
})
export class AiModule {}
