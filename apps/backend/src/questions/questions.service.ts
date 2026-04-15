import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../database/schemas/question.schema';
import { Topic, TopicDocument } from '../database/schemas/topic.schema';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionsDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async findAll(query: QueryQuestionsDto) {
    const { track, difficulty, search, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (track) filter.track = track;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }
    
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    } else if (!query.status) {
      filter.$or = [{ status: 'LIVE' }, { isPublished: true }];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.questionModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.questionModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const question = await this.questionModel.findById(id).lean();
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async findGrouped() {
    const questions = await this.questionModel
      .find({ $or: [{ status: 'LIVE' }, { isPublished: true }] })
      .select('title track difficulty tags attemptCount avgScore status')
      .sort({ track: 1, difficulty: 1 })
      .lean();

    const grouped: Record<string, any[]> = {};
    questions.forEach((q) => {
      if (!grouped[q.track]) grouped[q.track] = [];
      grouped[q.track].push(q);
    });

    return grouped;
  }

  async findTopicsByQuestionId(id: string) {
    const question = await this.questionModel.findById(id).populate('topics').lean();
    if (!question) throw new NotFoundException('Question not found');
    return question.topics || [];
  }

  async create(dto: CreateQuestionDto) {
    const question = await this.questionModel.create({
      ...dto,
      topics: dto.topicIds || [],
    });
    return question.toObject();
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const updateData: any = { ...dto };
    if (dto.topicIds) {
      updateData.topics = dto.topicIds;
      delete updateData.topicIds;
    }

    const question = await this.questionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async remove(id: string) {
    const result = await this.questionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Question not found');
    return { deleted: true };
  }
}
