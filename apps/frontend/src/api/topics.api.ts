import client from './client';
import type { ApiResponse, Topic } from '@/types';

export const topicsApi = {
  getAll: (params?: { track?: string; category?: string; page?: number; limit?: number; status?: string }) =>
    client.get<ApiResponse<Topic[]>>('/api/topics', { params }),

  getById: (id: string) =>
    client.get<ApiResponse<Topic>>(`/api/topics/${id}`),

  getNext: (id: string) =>
    client.get<ApiResponse<Topic[]>>(`/api/topics/${id}/next`),

  create: (data: Partial<Topic>) =>
    client.post<ApiResponse<Topic>>('/api/topics', data),

  update: (id: string, data: Partial<Topic>) =>
    client.put<ApiResponse<Topic>>(`/api/topics/${id}`, data),

  delete: (id: string) =>
    client.delete(`/api/topics/${id}`),
};
