import { useLocation } from 'react-router-dom';
import { routes } from '../routes';
import { Wrapper } from '../components/ui';
import type { ReactNode } from 'react';

/**
 * Mapeo de rutas a contenido
 */
const routeContent: Record<string, ReactNode> = {
  [routes.root]: <div>Login Content</div>,
  [routes.auth.register]: <div>Register Content</div>
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
    <Wrapper>
      {content}
    </Wrapper>
  );
};

