import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Interceptor para agregar token si es necesario
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ [API] No hay token en localStorage para la petición:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente y refresh automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no es una petición de refresh, intentar refrescar el token
    // Excluir el endpoint de refresh para evitar loops infinitos
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
      console.log('🔄 [API] Token expirado, intentando refrescar...');
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
        // No hay refresh token, limpiar y redirigir
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        processQueue(error, null);
        isRefreshing = false;
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
        // Error al refrescar, limpiar y redirigir
        console.error('❌ [API] Error al refrescar token:', refreshError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        
        // Si el error es 401 en el refresh, redirigir a login
        if ((refreshError as AxiosError).response?.status === 401) {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
