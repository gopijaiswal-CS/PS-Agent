import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoachService } from './coach.service';
import { StartCoachSessionDto } from './dto/coach.dto';
import { COACH_PERSONAS } from './personas';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  // GET /api/coach/personas — list all available personas
  @Get('personas')
  getPersonas() {
    return Object.values(COACH_PERSONAS).map(({ systemPromptExtra, ...safe }) => safe);
  }

  // POST /api/coach/sessions — start a new coach session
  @Post('sessions')
  async startSession(@Body() dto: StartCoachSessionDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.coachService.startSession(userId, dto.questionId, dto.coachPersona);
  }

  // GET /api/coach/sessions/history — paginated session history
  @Get('sessions/history')
  async getHistory(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    const userId = req.user?.userId;
    return this.coachService.getHistory(userId, +page, +limit);
  }

  // GET /api/coach/sessions/:id — get a single session (polling for report)
  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    return this.coachService.getSession(id);
  }

  // GET /api/coach/sessions/:id/report — convenience alias for the report view
  @Get('sessions/:id/report')
  async getReport(@Param('id') id: string) {
    return this.coachService.getReport(id);
  }

  // POST /api/coach/sessions/:id/end — ends session, triggers async score computation
  @Post('sessions/:id/end')
  @HttpCode(HttpStatus.OK)
  async endSession(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.coachService.endSession(id, userId);
  }
}
