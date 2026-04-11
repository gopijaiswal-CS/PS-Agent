import client from './client';
import type { ApiResponse, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    client.post<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/login', { email, password }),

  register: (email: string, password: string, name?: string) =>
    client.post<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/register', { email, password, name }),

  oauthCallback: (supabaseToken: string) =>
    client.post<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/oauth/callback', { supabaseToken }),

  refresh: () =>
    client.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh'),

  logout: () =>
    client.post('/api/auth/logout'),

  getMe: () =>
    client.get<ApiResponse<User>>('/api/auth/me'),
};
