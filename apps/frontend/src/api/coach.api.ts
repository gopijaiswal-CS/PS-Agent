import client from './client';

export const coachApi = {
  getPersonas: () =>
    client.get('/api/coach/personas'),

  startSession: (data: { questionId: string; coachPersona?: string }) =>
    client.post('/api/coach/sessions', data),

  getSession: (id: string) =>
    client.get(`/api/coach/sessions/${id}`),

  getReport: (id: string) =>
    client.get(`/api/coach/sessions/${id}/report`),

  endSession: (id: string) =>
    client.post(`/api/coach/sessions/${id}/end`, {}),

  getHistory: (params?: { page?: number; limit?: number }) =>
    client.get('/api/coach/sessions/history', { params }),
};
