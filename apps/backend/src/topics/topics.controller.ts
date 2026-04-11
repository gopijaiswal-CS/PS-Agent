import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, UpdateTopicDto, QueryTopicsDto } from './dto/topic.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schemas/user.schema';

@Controller('topics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryTopicsDto) {
    return this.topicsService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.topicsService.findById(id);
  }

  @Get(':id/next')
  async findNextTopics(@Param('id') id: string) {
    return this.topicsService.findNextTopics(id);
  }

  @Post()
  @Roles(UserRole.CONTENT_ADMIN)
  async create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.CONTENT_ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.topicsService.remove(id);
  }
}
