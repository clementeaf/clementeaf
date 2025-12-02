import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthUrl } from '../config/frontendUrls';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * @param children - Componentes hijos a renderizar si está autenticado
 * @returns Componente protegido o redirección a login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getAuthUrl();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

