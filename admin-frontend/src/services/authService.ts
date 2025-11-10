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
  }
};

