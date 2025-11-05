import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiErrorResponse } from './types';

/**
 * Cliente HTTP configurado para el backend
 */
export const apiClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor para agregar token JWT a las peticiones
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor para manejar respuestas de error (401, 403, etc.)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Manejar token expirado o inválido
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar localStorage
      localStorage.removeItem('token');
      // Opcional: redirigir a login si es necesario
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Extrae el mensaje de error de una respuesta de Axios
 * @param error - Error de Axios o Error genérico
 * @param defaultMessage - Mensaje por defecto si no se puede extraer
 * @returns Mensaje de error extraído
 */
export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.response?.data) {
    const errorData = axiosError.response.data;
    return errorData.error || errorData.message || errorData.data?.error || defaultMessage;
  }

  return defaultMessage;
};

