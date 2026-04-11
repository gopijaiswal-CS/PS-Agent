import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../database/schemas/session.schema';
import { Question, QuestionDocument } from '../database/schemas/question.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async create(userId: string, questionId: string) {
    const question = await this.questionModel.findById(questionId).lean();
    if (!question) throw new NotFoundException('Question not found');

    const session = await this.sessionModel.create({ userId, questionId });
    return session.toObject();
  }

  async findById(id: string, userId: string) {
    const session = await this.sessionModel.findById(id).populate('questionId').lean();
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId.toString() !== userId) throw new ForbiddenException();
    return session;
  }

  async updateDiagram(id: string, userId: string, diagramJSON: Record<string, any>) {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId.toString() !== userId) throw new ForbiddenException();

    session.diagramJSON = diagramJSON;
    await session.save();
    return session.toObject();
  }

  async updateTranscript(id: string, userId: string, voiceTranscript: string) {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId.toString() !== userId) throw new ForbiddenException();

    session.voiceTranscript = voiceTranscript;
    await session.save();
    return session.toObject();
  }

  async getHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.sessionModel.find({ userId }).populate('questionId', 'title track difficulty').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.sessionModel.countDocuments({ userId }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getHint(id: string, userId: string, level: number) {
    const session = await this.sessionModel.findById(id).populate('questionId').lean();
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId.toString() !== userId) throw new ForbiddenException();

    const question = session.questionId as any;
    if (!question.hints || question.hints.length === 0) {
      return { hint: 'No hints available for this question.' };
    }

    const hintIndex = Math.min(level - 1, question.hints.length - 1);
    
    // Update hints used
    await this.sessionModel.findByIdAndUpdate(id, {
      hintsUsed: Math.max(session.hintsUsed, level),
    });

    return { hint: question.hints[hintIndex], level };
  }

  async updateRating(id: string, rating: any) {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      { aiRating: rating, isCompleted: true },
      { new: true },
    ).lean();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async addChatMessage(id: string, role: string, content: string) {
    await this.sessionModel.findByIdAndUpdate(id, {
      $push: { chatHistory: { role, content, timestamp: new Date().toISOString() } },
    });
  }
}
