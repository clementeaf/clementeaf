import axios, { type AxiosInstance } from 'axios';

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

