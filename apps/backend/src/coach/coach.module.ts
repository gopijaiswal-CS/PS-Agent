import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoachSession, CoachSessionSchema } from '../database/schemas/coach.schema';
import { Question, QuestionSchema } from '../database/schemas/question.schema';
import { User, UserSchema } from '../database/schemas/user.schema';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { CoachGateway } from './coach.gateway';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoachSession.name, schema: CoachSessionSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AiModule,
  ],
  controllers: [CoachController],
  providers: [CoachService, CoachGateway],
  exports: [CoachService],
})
export class CoachModule {}
