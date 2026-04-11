import client from './client';
import type { ApiResponse, Session, AiRating } from '@/types';

export const sessionsApi = {
  create: (questionId: string) =>
    client.post<ApiResponse<Session>>('/api/sessions', { questionId }),

  getById: (id: string) =>
    client.get<ApiResponse<Session>>(`/api/sessions/${id}`),

  updateDiagram: (id: string, diagramJSON: Record<string, unknown>) =>
    client.put<ApiResponse<Session>>(`/api/sessions/${id}/diagram`, { diagramJSON }),

  updateTranscript: (id: string, voiceTranscript: string) =>
    client.put<ApiResponse<Session>>(`/api/sessions/${id}/transcript`, { voiceTranscript }),

  rate: (id: string) =>
    client.post<ApiResponse<AiRating>>(`/api/sessions/${id}/rate`),

  getHistory: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<Session[]>>('/api/sessions/history', { params }),

  getHint: (id: string, level: number) =>
    client.get<ApiResponse<{ hint: string }>>(`/api/sessions/${id}/hint/${level}`),
};
