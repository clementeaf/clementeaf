import { create } from 'zustand';
import type { User } from '../api/types';
import { deleteCookie, getCookie } from '../utils/cookies';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  checkAuth: () => void;
}

/**
 * Store de autenticación usando Zustand
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setAuthenticated: (isAuthenticated: boolean) => {
    set({ isAuthenticated });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  logout: () => {
    deleteCookie('authToken');
    deleteCookie('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = getCookie('authToken');
    const refreshToken = getCookie('refreshToken');
    
    if (token && refreshToken) {
      set({ isAuthenticated: true, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));

