import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://9hzayjhnz8.execute-api.us-east-1.amazonaws.com/dev';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token si es necesario
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si es necesario
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);
