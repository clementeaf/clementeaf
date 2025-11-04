import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/auth';
import type { RegisterRequest, LoginRequest, RegisterResponse, LoginResponse } from '../api/types';

/**
 * Hook para registro de usuarios
 * @returns Mutación para registrar un usuario
 */
export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      console.log('User registered successfully:', data);
    },
    onError: (error) => {
      console.error('Registration error:', error);
    }
  });
};

/**
 * Hook para login de usuarios
 * @returns Mutación para autenticar un usuario
 */
export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      console.log('Login successful:', data);
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });
};

