import client from './client';
import type { ApiResponse, User } from '@/types';

export const adminApi = {
  getUsers: (params?: { page?: number; role?: string }) =>
    client.get<ApiResponse<User[]>>('/api/admin/users', { params }),

  updateUserRole: (id: string, role: string) =>
    client.put<ApiResponse<User>>(`/api/admin/users/${id}/role`, { role }),

  updateUserPlan: (id: string, plan: string) =>
    client.put<ApiResponse<User>>(`/api/admin/users/${id}/plan`, { plan }),

  getAnalytics: () =>
    client.get('/api/admin/analytics'),

  getQuestionStats: () =>
    client.get('/api/admin/questions/stats'),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<ApiResponse<{ url: string }>>('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (url: string) =>
    client.delete('/api/upload/image', { data: { url } }),
};
