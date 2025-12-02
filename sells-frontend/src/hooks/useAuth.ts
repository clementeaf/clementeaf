import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { MeResponse } from '../api/types';
import { getAuthUrl } from '../config/frontendUrls';

/**
 * Hook para manejar la autenticación
 * @returns Estado y funciones de autenticación
 */
export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    setUser, 
    setLoading, 
    logout, 
    checkAuth 
  } = useAuthStore();

  /**
   * Verifica si el usuario está autenticado
   */
  const verifyAuth = async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!token || !refreshToken) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<MeResponse>(endpoints.auth.me);
      setUser(response.data.data);
      setLoading(false);
    } catch (error) {
      // Si falla la verificación, limpiar y redirigir
      logout();
      window.location.href = getAuthUrl();
    }
  };

  /**
   * Cierra sesión y redirige a auth-frontend
   */
  const handleLogout = (): void => {
    logout();
    window.location.href = getAuthUrl();
  };

  useEffect(() => {
    checkAuth();
    verifyAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    verifyAuth,
  };
};

