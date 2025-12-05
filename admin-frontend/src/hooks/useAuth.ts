import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type AuthUser } from '../services/authService';
import { getFrontendUrls } from '../config/frontendUrls';

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
        const user = await authService.getCurrentUser();
        
        // Log del usuario actual
        console.log('🔐 [AUTH] Usuario autenticado:', {
          id: user.id,
          email: user.email,
          name: user.name || 'Sin nombre',
          role: user.role ? {
            id: user.role.id,
            name: user.role.name,
            isActive: user.role.isActive
          } : 'Sin rol asignado',
          permissions: user.permissions || [],
          permissionsCount: user.permissions?.length || 0
        });
        
        return user;
      } catch (error) {
        // Si el error es 401 (Unauthorized), el token es inválido o expiró
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          console.warn('⚠️ [AUTH] Token inválido o expirado. Limpiando sesión...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          
          // Redirigir a auth-frontend solo si no hay token en la URL
          const urlParams = new URLSearchParams(window.location.search);
          const tokenInUrl = urlParams.get('token');
          
          if (!tokenInUrl) {
            const { auth: authUrl } = getFrontendUrls();
            window.location.href = authUrl;
          }
          
          // Retornar un usuario temporal para evitar errores
          return {
            id: 0,
            email: '',
            name: null,
            role: null,
            permissions: []
          } as AuthUser;
        }
        
        // Para otros errores, intentar usar el userId del token como fallback
        if (userIdFromToken) {
          const fallbackUser = {
            id: userIdFromToken,
            email: '',
            name: null,
            role: null,
            permissions: []
          } as AuthUser;
          
          console.warn('⚠️ [AUTH] Usuario obtenido desde token (sin datos completos):', {
            id: fallbackUser.id,
            email: fallbackUser.email || 'No disponible',
            name: fallbackUser.name || 'No disponible'
          });
          
          return fallbackUser;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!token || !!userIdFromToken
  });
};

/**
 * Hook para cerrar sesión y redirigir a auth-frontend
 * @returns Función para cerrar sesión
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  /**
   * Cierra la sesión del usuario
   * Limpia los tokens, invalida las queries y redirige a auth-frontend
   */
  const logout = async (): Promise<void> => {
    try {
      // Intentar cerrar sesión en el servidor
      await authService.logout();
    } catch (error) {
      // Si falla, continuar con la limpieza local
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar tokens del localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      // Invalidar todas las queries de React Query
      queryClient.clear();

      // Redirigir a auth-frontend
      const { auth: authUrl } = getFrontendUrls();
      window.location.href = authUrl;
    }
  };

  return { logout };
};

