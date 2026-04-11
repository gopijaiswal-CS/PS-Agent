import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserDocument, UserRole, UserPlan } from '../database/schemas/user.schema';
import { Question, QuestionDocument } from '../database/schemas/question.schema';
import { Session, SessionDocument } from '../database/schemas/session.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 20, @Query('role') role?: string) {
    const filter: any = {};
    if (role) filter.role = role;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find(filter).select('-password -refreshToken').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.userModel.countDocuments(filter),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  @Put('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    const user = await this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password -refreshToken').lean();
    return user;
  }

  @Put('users/:id/plan')
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserPlan(@Param('id') id: string, @Body('plan') plan: UserPlan) {
    const user = await this.userModel.findByIdAndUpdate(id, { plan }, { new: true }).select('-password -refreshToken').lean();
    return user;
  }

  @Get('analytics')
  @Roles(UserRole.SUPER_ADMIN)
  async getAnalytics() {
    const [totalUsers, totalQuestions, totalSessions, avgScore] = await Promise.all([
      this.userModel.countDocuments(),
      this.questionModel.countDocuments(),
      this.sessionModel.countDocuments(),
      this.sessionModel.aggregate([
        { $match: { 'aiRating.overall': { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$aiRating.overall' } } },
      ]),
    ]);
    return {
      totalUsers,
      totalQuestions,
      totalSessions,
      averageScore: avgScore[0]?.avg || 0,
    };
  }

  @Get('questions/stats')
  @Roles(UserRole.CONTENT_ADMIN)
  async getQuestionStats() {
    const stats = await this.questionModel.aggregate([
      { $group: { _id: '$track', count: { $sum: 1 }, avgScore: { $avg: '$avgScore' }, totalAttempts: { $sum: '$attemptCount' } } },
      { $sort: { _id: 1 } },
    ]);
    return stats;
  }
}
