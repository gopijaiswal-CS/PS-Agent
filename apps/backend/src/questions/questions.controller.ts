import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionsDto } from './dto/question.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schemas/user.schema';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryQuestionsDto) {
    return this.questionsService.findAll(query);
  }

  @Public()
  @Get('grouped')
  async findGrouped() {
    return this.questionsService.findGrouped();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Get(':id/topics')
  async findTopics(@Param('id') id: string) {
    return this.questionsService.findTopicsByQuestionId(id);
  }

  @Post()
  @Roles(UserRole.CONTENT_ADMIN)
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.CONTENT_ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
