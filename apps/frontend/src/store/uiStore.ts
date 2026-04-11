import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  hintLevel: number;
  ratingModalOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setHintLevel: (level: number) => void;
  setRatingModalOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  hintLevel: 0,
  ratingModalOpen: false,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setHintLevel: (level) => set({ hintLevel: level }),
  setRatingModalOpen: (open) => set({ ratingModalOpen: open }),
  setTheme: (theme) => set({ theme }),
}));
