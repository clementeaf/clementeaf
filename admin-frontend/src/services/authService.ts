import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

/**
 * Usuario autenticado
 */
export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
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
  }
};

