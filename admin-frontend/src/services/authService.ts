import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

/**
 * Rol del usuario
 */
export interface UserRole {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

/**
 * Usuario autenticado
 */
export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole | null;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
  data: {
    token: string;
    refreshToken: string;
    user: AuthUser;
  };
  message: string;
}

/**
 * Servicio para gestionar autenticación
 */
export const authService = {
  /**
   * Obtiene el usuario actual autenticado
   * @returns Usuario autenticado
   */
  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ data: AuthUser }>(endpoints.auth.me);
    return data.data;
  },

  /**
   * Refresca el access token usando el refresh token
   * @param refreshToken - Refresh token almacenado
   * @returns Nuevo access token y refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const { data } = await apiClient.post<RefreshTokenResponse>(
      endpoints.auth.refresh,
      { refreshToken }
    );
    return data;
  },

  /**
   * Cierra la sesión del usuario actual
   * @returns Respuesta del servidor
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(endpoints.auth.logout);
    } catch (error) {
      // Si falla el logout en el servidor, continuar con la limpieza local
      console.error('Error al cerrar sesión en el servidor:', error);
    }
  }
};

