import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

interface User {
  id: number;
  username: string;
  email: string | null;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('simrs_user') || 'null')
    : null,
  accessToken: typeof window !== 'undefined'
    ? localStorage.getItem('simrs_access_token')
    : null,
  refreshToken: typeof window !== 'undefined'
    ? localStorage.getItem('simrs_refresh_token')
    : null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      const { user, accessToken, refreshToken } = res.data;

      localStorage.setItem('simrs_user', JSON.stringify(user));
      localStorage.setItem('simrs_access_token', accessToken);
      localStorage.setItem('simrs_refresh_token', refreshToken);

      set({ user, accessToken, refreshToken, isLoading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login gagal';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('simrs_user');
    localStorage.removeItem('simrs_access_token');
    localStorage.removeItem('simrs_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  isAuthenticated: () => {
    return !!get().accessToken;
  },

  hasRole: (role: string) => {
    return get().user?.roles?.includes(role) || false;
  },
}));
