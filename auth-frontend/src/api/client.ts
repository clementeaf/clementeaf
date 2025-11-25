import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from './types';
import { authService } from './auth';

/**
 * Cliente HTTP configurado para el backend
 */
export const apiClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Procesa la cola de peticiones fallidas después de refrescar el token
 */
const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Interceptor para agregar token JWT a las peticiones
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor para manejar respuestas de error y refresh automático
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no es una petición de refresh, intentar refrescar el token
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No hay refresh token, limpiar y redirigir a login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        processQueue(error, null);
        isRefreshing = false;
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        const response = await authService.refreshToken(refreshToken);
        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Guardar nuevos tokens
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Actualizar el header de la petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Procesar cola de peticiones fallidas
        processQueue(null, newToken);
        isRefreshing = false;

        // Reintentar la petición original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Error al refrescar, limpiar y redirigir a login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
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

