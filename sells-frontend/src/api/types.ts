/**
 * Tipos para las respuestas del backend
 */
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

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface RefreshTokenResponse {
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
  message: string;
}

export interface MeResponse {
  data: User;
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

