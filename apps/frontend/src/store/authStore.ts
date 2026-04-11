import { create } from 'zustand';
import type { User } from '@techprep/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setToken: (token) => set({ accessToken: token }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, accessToken: null, isLoading: false }),
}));
