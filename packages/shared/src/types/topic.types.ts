import { QuestionTrack } from './question.types';

export interface Topic {
  _id: string;
  name: string;
  category: string;
  track: QuestionTrack;
  content: Record<string, unknown>;
  images: string[];
  prerequisites: string[];
  nextTopics: string[];
  order: number;
  estimatedReadMinutes?: number;
  isPublished?: boolean;
  status: 'DRAFT' | 'PENDING' | 'LIVE';
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}
