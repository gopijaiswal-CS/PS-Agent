import client from './client';
import type { ApiResponse, Question, GroupedQuestions, Topic } from '@/types';

export const questionsApi = {
  getAll: (params?: { track?: string; difficulty?: number; search?: string; page?: number; limit?: number }) =>
    client.get<ApiResponse<Question[]>>('/api/questions', { params }),

  getById: (id: string) =>
    client.get<ApiResponse<Question>>(`/api/questions/${id}`),

  getGrouped: () =>
    client.get<ApiResponse<GroupedQuestions>>('/api/questions/grouped'),

  getTopics: (id: string) =>
    client.get<ApiResponse<Topic[]>>(`/api/questions/${id}/topics`),

  create: (data: Partial<Question>) =>
    client.post<ApiResponse<Question>>('/api/questions', data),

  update: (id: string, data: Partial<Question>) =>
    client.put<ApiResponse<Question>>(`/api/questions/${id}`, data),

  delete: (id: string) =>
    client.delete(`/api/questions/${id}`),
};
