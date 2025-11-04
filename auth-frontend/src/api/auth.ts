import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { RegisterRequest, LoginRequest, RegisterResponse, LoginResponse } from './types';

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
  }
};

