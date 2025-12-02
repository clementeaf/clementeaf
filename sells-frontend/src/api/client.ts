import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse, RefreshTokenResponse } from './types';
import { endpoints } from './endpoints';
import { getAuthUrl } from '../config/frontendUrls';

/**
 * Base URL del backend
 * Usa variable de entorno o valor por defecto de producción (AWS)
 * Para desarrollo local con serverless-offline, configurar: VITE_API_URL=http://localhost:9500/dev
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://7ebampwqf4.execute-api.us-east-1.amazonaws.com/dev';

/**
 * Cliente HTTP configurado para el backend
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string) => void;
  reject: (error?: unknown) => void;
}> = [];

/**
 * Procesa la cola de peticiones fallidas después de refrescar el token
 */
const processQueue = (error: AxiosError | null, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || undefined);
    }
  });
  
  failedQueue = [];
};

/**
 * Interceptor para agregar token de autenticación a las peticiones
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
        window.location.href = getAuthUrl();
        return Promise.reject(error);
      }

      try {
        const response = await apiClient.post<RefreshTokenResponse>(
          endpoints.auth.refresh,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

        if (newToken) {
          localStorage.setItem('authToken', newToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null, newToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Error al refrescar, limpiar y redirigir a login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        window.location.href = getAuthUrl();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

