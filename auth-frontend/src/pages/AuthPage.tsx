import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../routes';
import { Wrapper, FormHeader } from '../components/ui';
import { Form } from '../components/Form';
import { useRegister, useLogin } from '../hooks/useAuth';
import type { ReactNode } from 'react';
import { registerFormConfig, loginFormConfig } from './authForms.config';
import type { RegisterRequest, LoginRequest } from '../api/types';
import { extractErrorMessage } from '../api/client';

/**
 * Componente para el formulario de registro
 */
const RegisterForm = () => {
  const { mutate: register, isPending } = useRegister();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = (data: RegisterRequest | LoginRequest) => {
    setApiError(null);
    register(data as RegisterRequest, {
      onError: (error) => {
        const errorMessage = extractErrorMessage(
          error,
          'Registration failed. Please try again.'
        );
        setApiError(errorMessage);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <FormHeader subtitle="Registrarse" />
      {apiError && (
        <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {apiError}
        </div>
      )}
      <Form
        {...registerFormConfig}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
};

/**
 * Componente para el formulario de login
 */
const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (data: RegisterRequest | LoginRequest) => {
    setApiError(null);
    login(data as LoginRequest, {
      onError: (error) => {
        const errorMessage = extractErrorMessage(
          error,
          'Login failed. Please check your credentials.'
        );
        setApiError(errorMessage);
      }
    });
  };

  const handleRegisterClick = () => {
    navigate(routes.auth.register);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <FormHeader subtitle="Iniciar sesión" />
      {apiError && (
        <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {apiError}
        </div>
      )}
      <Form
        {...loginFormConfig}
        onSubmit={handleSubmit}
        isLoading={isPending}
        forgotPasswordLink={
          <a 
            href="#" 
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Olvidaste tu contraseña?
          </a>
        }
        registerLink={
          <button
            type="button"
            onClick={handleRegisterClick}
            className="text-sm text-blue-500 hover:text-blue-700 hover:border-blue-700 transition-colors duration-200 bg-transparent"
          >
            Registro
          </button>
        }
      />
    </div>
  );
};

/**
 * Mapeo de rutas a contenido
 */
const routeContent: Record<string, ReactNode> = {
  [routes.root]: <LoginForm />,
  [routes.auth.register]: <RegisterForm />
};

/**
 * Contenido por defecto para rutas no encontradas
 */
const defaultContent: ReactNode = <div>404 - Page Not Found</div>;

/**
 * Componente de página única que responde a todas las rutas
 * Cambia el contenido según la ruta actual
 */
export const AuthPage = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  /**
   * Obtiene el contenido según la ruta actual
   */
  const content = routeContent[currentPath] ?? defaultContent;

  return (
    <Wrapper className='flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-4 w-auto min-w-[400px]'>
      {content}
    </Wrapper>
  );
};

