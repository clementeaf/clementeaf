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
    onSuccess: (_data, variables) => {
      // Después de registro exitoso, hacer login automático con las credenciales usadas
      authService.login({
        email: variables.email,
        password: variables.password
      }).then((loginResponse) => {
        if (loginResponse.data.token) {
          localStorage.setItem('authToken', loginResponse.data.token);
        }
        if (loginResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', loginResponse.data.refreshToken);
        }
        // Redirigir a la página de selección de aplicación
        navigate('/select-app');
      }).catch((error) => {
        // Si el login automático falla, redirigir a login manual
        console.error('Auto-login after registration failed:', error);
        navigate('/');
      });
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
        localStorage.setItem('authToken', data.data.token);
      }
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      // Redirigir a la página de selección de aplicación después del login exitoso
      navigate('/select-app');
    },
    onError: (error) => {
      // El error se manejará en el componente que usa el hook
      console.error('Login error:', error);
    }
  });
};

