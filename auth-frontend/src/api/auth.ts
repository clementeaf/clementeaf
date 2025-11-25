import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { RegisterRequest, LoginRequest, RegisterResponse, LoginResponse } from './types';

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      name: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Registra un nuevo usuario
   * @param data - Datos de registro
   * @returns Respuesta con usuario creado
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      endpoints.auth.register,
      data
    );
    return response.data;
  },

  /**
   * Autentica un usuario y obtiene token JWT
   * @param data - Datos de login
   * @returns Respuesta con token y usuario
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      endpoints.auth.login,
      data
    );
    return response.data;
  },

  /**
   * Refresca el access token usando el refresh token
   * @param refreshToken - Refresh token almacenado
   * @returns Nuevo access token y refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      endpoints.auth.refresh,
      { refreshToken }
    );
    return response.data;
  }
};

