/**
 * Tipos para las respuestas del backend
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  message: string;
  data: User;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface MeResponse {
  data: User;
}

export interface LogoutResponse {
  message: string;
}

export interface ApiError {
  error: string;
}

/**
 * Respuesta de error de la API
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  data?: {
    error?: string;
  };
}

