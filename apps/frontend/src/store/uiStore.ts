import { create } from 'zustand';

export type AppTheme = 'midnight' | 'aurora' | 'ember' | 'ocean' | 'forest';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface UiState {
  sidebarOpen: boolean;
  hintLevel: number;
  ratingModalOpen: boolean;
  theme: AppTheme;
  profileDropdownOpen: boolean;
  notificationsOpen: boolean;
  notifications: NotificationItem[];
  newsletterEmail: string;
  newsletterSubscribed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setHintLevel: (level: number) => void;
  setRatingModalOpen: (open: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  setProfileDropdownOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  markAllRead: () => void;
  markNotificationRead: (id: string) => void;
  setNewsletterEmail: (email: string) => void;
  subscribeNewsletter: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  hintLevel: 0,
  ratingModalOpen: false,
  theme: 'midnight',
  profileDropdownOpen: false,
  notificationsOpen: false,
  notifications: [
    {
      id: 'welcome',
      title: 'Welcome to TechPrep',
      message: 'Your practice dashboard is ready. Start with a live question or explore topics.',
      createdAt: new Date().toISOString(),
      read: false,
    },
  ],
  newsletterEmail: '',
  newsletterSubscribed: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setHintLevel: (level) => set({ hintLevel: level }),
  setRatingModalOpen: (open) => set({ ratingModalOpen: open }),
  setTheme: (theme) => set({ theme }),
  setProfileDropdownOpen: (open) => set({ profileDropdownOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  setNewsletterEmail: (email) => set({ newsletterEmail: email }),
  subscribeNewsletter: () =>
    set({
      newsletterSubscribed: true,
      newsletterEmail: '',
    }),
}));
