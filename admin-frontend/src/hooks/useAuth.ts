import { useQuery } from '@tanstack/react-query';
import { authService, type AuthUser } from '../services/authService';

/**
 * Decodifica un JWT y extrae el payload
 */
const decodeJWT = (token: string): { userId?: number; email?: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Token JWT inválido: no tiene payload');
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded;
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

/**
 * Obtiene el userId desde el token JWT
 */
const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return null;
  }

  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  const userId = decoded.userId;
  return userId || null;
};

/**
 * Hook para obtener el usuario actual autenticado
 * Intenta obtener desde el servidor, si falla usa el token JWT
 */
export const useCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  const userIdFromToken = getUserIdFromToken();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        if (userIdFromToken) {
          return {
            id: userIdFromToken,
            email: '',
            name: null
          } as AuthUser;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!token || !!userIdFromToken
  });
};

