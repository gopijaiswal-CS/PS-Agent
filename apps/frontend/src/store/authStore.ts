import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set((state) => ({ user, isAuthenticated: !!state.accessToken, isLoading: false })),
  setToken: (token) => set((state) => ({ accessToken: token, isAuthenticated: !!state.user && !!token })),
  setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
}));
