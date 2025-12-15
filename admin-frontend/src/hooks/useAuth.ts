import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type AuthUser } from '../services/authService';
import { getFrontendUrls } from '../config/frontendUrls';
import { logger } from '../utils/logger';
import { deleteCookie, getCookie } from '../utils/cookies';

/**
 * Decodifica un JWT y extrae el payload
 */
const decodeJWT = (token: string): { userId?: number; email?: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      logger.error('Token JWT inválido: no tiene payload');
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
    logger.error('Error decodificando JWT', error);
    return null;
  }
};

/**
 * Obtiene el userId desde el token JWT
 */
const getUserIdFromToken = (): number | null => {
  const token = getCookie('authToken');
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
 * Obtiene datos básicos del usuario desde el token JWT (sin llamada HTTP)
 * @returns Usuario básico desde token o null
 */
const getOptimisticUserFromToken = (): AuthUser | null => {
  const token = getCookie('authToken');
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.userId) return null;

  // Retornar usuario optimista con permisos vacíos (se cargarán del servidor)
  return {
    id: decoded.userId,
    email: decoded.email || '',
    name: null,
    role: null,
    permissions: [] // Se cargarán del servidor
  } as AuthUser;
};

/**
 * Hook para obtener el usuario actual autenticado
 * Usa datos optimistas del token para renderizar inmediatamente
 * Luego actualiza con datos del servidor en background
 */
export const useCurrentUser = () => {
  const token = getCookie('authToken');
  const userIdFromToken = getUserIdFromToken();
  const optimisticUser = getOptimisticUserFromToken();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const user = await authService.getCurrentUser();
        
        // Log del usuario actual (solo en desarrollo)
        logger.debug('[AUTH] Usuario autenticado', {
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
          logger.warn('[AUTH] Token inválido o expirado. Limpiando sesión...');
          deleteCookie('authToken');
          deleteCookie('refreshToken');
          
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
        if (userIdFromToken && optimisticUser) {
          logger.warn('[AUTH] Usando datos optimistas del token (sin datos completos del servidor)');
          return optimisticUser;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos - datos frescos por más tiempo
    gcTime: 1000 * 60 * 30, // 30 minutos - mantener en caché más tiempo
    retry: 1, // Reintentar una vez en caso de error de red
    retryDelay: 1000, // Esperar 1 segundo antes de reintentar
    enabled: !!token || !!userIdFromToken,
    // Datos optimistas: mostrar usuario básico inmediatamente mientras carga del servidor
    placeholderData: optimisticUser || undefined,
    // Refetch en background para actualizar permisos sin bloquear UI
    refetchOnMount: 'always', // Siempre refetch pero no bloquea
    refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
    refetchOnReconnect: true // Refetch solo al reconectar internet
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
  const logout = (): void => {
    deleteCookie('authToken');
    deleteCookie('refreshToken');
    queryClient.clear();

    const { auth: authUrl } = getFrontendUrls();

    void authService.logout().catch((error: unknown) => {
      logger.error('Error al cerrar sesión', error);
    });

    window.location.assign(authUrl);
  };

  return { logout };
};

