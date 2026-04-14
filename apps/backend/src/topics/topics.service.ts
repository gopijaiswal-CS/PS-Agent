import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from '../database/schemas/topic.schema';
import { CreateTopicDto, UpdateTopicDto, QueryTopicsDto } from './dto/topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async findAll(query: QueryTopicsDto) {
    const { track, category, page = 1, limit = 50 } = query;
    const filter: any = {};

    if (track) filter.track = track;
    if (category) filter.category = category;

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    } else if (!query.status) {
      filter.$or = [{ status: 'LIVE' }, { isPublished: true }];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.topicModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.topicModel.countDocuments(filter),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const topic = await this.topicModel.findById(id).populate('prerequisites nextTopics').lean();
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async findNextTopics(id: string) {
    const topic = await this.topicModel.findById(id).populate('nextTopics').lean();
    if (!topic) throw new NotFoundException('Topic not found');
    return topic.nextTopics || [];
  }

  async create(dto: CreateTopicDto) {
    const topic = await this.topicModel.create({
      ...dto,
      content: dto.content || { type: 'doc', content: [] },
      prerequisites: dto.prerequisiteIds || [],
      nextTopics: dto.nextTopicIds || [],
    });
    return topic.toObject();
  }

  async update(id: string, dto: UpdateTopicDto) {
    const updateData: any = { ...dto };
    if (dto.prerequisiteIds) { updateData.prerequisites = dto.prerequisiteIds; delete updateData.prerequisiteIds; }
    if (dto.nextTopicIds) { updateData.nextTopics = dto.nextTopicIds; delete updateData.nextTopicIds; }

    const topic = await this.topicModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async remove(id: string) {
    const result = await this.topicModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Topic not found');
    return { deleted: true };
  }
}
