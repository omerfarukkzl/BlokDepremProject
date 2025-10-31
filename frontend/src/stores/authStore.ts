import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';

interface LoginData {
  walletAddress: string;
  signature: string;
  message: string;
  name?: string;
  email?: string;
  locationId?: string;
}

interface AuthStore extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: LoginData & { name: string; email?: string; locationId: string }) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (data: LoginData) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual API call
          // const response = await authService.login(data);

          // Mock response for now
          const mockResponse = {
            user: {
              id: '1',
              walletAddress: data.walletAddress,
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'official' as const,
              locationId: '1',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          };

          set({
            user: mockResponse.user,
            token: mockResponse.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: LoginData & { name: string; email?: string; locationId: string }) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual API call
          // const response = await authService.register(data);

          // Mock response for now
          const mockResponse = {
            user: {
              id: '1',
              walletAddress: data.walletAddress,
              name: data.name,
              email: data.email,
              role: 'official' as const,
              locationId: data.locationId,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          };

          set({
            user: mockResponse.user,
            token: mockResponse.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);