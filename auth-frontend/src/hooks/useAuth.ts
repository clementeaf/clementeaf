import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import type { RegisterRequest, LoginRequest, RegisterResponse, LoginResponse } from '../api/types';

/**
 * Hook para registro de usuarios
 * @returns Mutación para registrar un usuario
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Redirigir a login después de registro exitoso
      navigate('/');
    },
    onError: (error) => {
      // El error se manejará en el componente que usa el hook
      console.error('Registration error:', error);
    }
  });
};

/**
 * Hook para login de usuarios
 * @returns Mutación para autenticar un usuario
 */
export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      // Redirigir después de login exitoso (puedes cambiar la ruta según necesites)
      // Por ahora, mantenemos en la misma página pero podrías redirigir a /dashboard
      navigate('/');
    },
    onError: (error) => {
      // El error se manejará en el componente que usa el hook
      console.error('Login error:', error);
    }
  });
};

