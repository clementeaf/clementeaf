import { useLocation } from 'react-router-dom';
import { routes } from '../routes';
import { Wrapper } from '../components/ui';
import { Form } from '../components/Form';
import { useRegister, useLogin } from '../hooks/useAuth';
import type { ReactNode } from 'react';
import { registerFormConfig, loginFormConfig } from './authForms.config';
import type { RegisterRequest, LoginRequest } from '../api/types';

/**
 * Componente para el formulario de registro
 */
const RegisterForm = () => {
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (data: RegisterRequest | LoginRequest) => {
    register(data as RegisterRequest);
  };

  return (
    <Form
      {...registerFormConfig}
      onSubmit={handleSubmit}
      isLoading={isPending}
    />
  );
};

/**
 * Componente para el formulario de login
 */
const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (data: RegisterRequest | LoginRequest) => {
    login(data as LoginRequest);
  };

  return (
    <Form
      {...loginFormConfig}
      onSubmit={handleSubmit}
      isLoading={isPending}
    />
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
    <Wrapper className='flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-4'>
      {content}
    </Wrapper>
  );
};

