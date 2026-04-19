import client from './client';
import axios from 'axios';
import type { ApiResponse, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    client.post<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/login', { email, password }),

  register: (email: string, password: string, name?: string) =>
    client.post<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/register', { email, password, name }),

  oauthCallback: (supabaseToken: string) =>
    client.post<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/oauth/callback', { supabaseToken }),

  refresh: () =>
    axios.post<ApiResponse<{ accessToken: string }>>(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/refresh`, {}, { withCredentials: true }),

  logout: () =>
    client.post('/api/auth/logout'),

  getMe: () =>
    client.get<ApiResponse<User>>('/api/auth/me'),
};
