import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(@CurrentUser('userId') userId: string, @Body('questionId') questionId: string) {
    return this.sessionsService.create(userId, questionId);
  }

  @Get('history')
  async getHistory(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sessionsService.getHistory(userId, page, limit);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.sessionsService.findById(id, userId);
  }

  @Put(':id/diagram')
  async updateDiagram(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body('diagramJSON') diagramJSON: Record<string, any>,
  ) {
    return this.sessionsService.updateDiagram(id, userId, diagramJSON);
  }

  @Put(':id/transcript')
  async updateTranscript(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body('voiceTranscript') voiceTranscript: string,
  ) {
    return this.sessionsService.updateTranscript(id, userId, voiceTranscript);
  }

  @Get(':id/hint/:level')
  async getHint(
    @Param('id') id: string,
    @Param('level') level: number,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sessionsService.getHint(id, userId, level);
  }

  @Post(':id/rate')
  async rate(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    // This will be wired to AI rating service
    const session = await this.sessionsService.findById(id, userId);
    return session;
  }
}
