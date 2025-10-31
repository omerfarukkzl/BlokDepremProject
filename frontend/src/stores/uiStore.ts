import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState, NotificationState } from '../types';

interface UIStore extends UIState {
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'tr' | 'en') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<NotificationState, 'id' | 'isVisible'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleLanguage: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'tr',
      sidebarOpen: false,
      notifications: [],

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      setLanguage: (language: 'tr' | 'en') => {
        set({ language });
      },

      toggleLanguage: () => {
        set((state) => ({ language: state.language === 'tr' ? 'en' : 'tr' }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      addNotification: (notification: Omit<NotificationState, 'id' | 'isVisible'>) => {
        const id = Date.now().toString();
        const newNotification: NotificationState = {
          ...notification,
          id,
          isVisible: true,
          duration: notification.duration || 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);