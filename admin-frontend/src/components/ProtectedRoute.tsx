import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { routes } from '../routes';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAny?: boolean;
}

/**
 * Componente para proteger rutas según permisos del usuario
 * @param props - Props del componente
 * @returns Componente protegido o redirección
 */
export const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAny = false
}: ProtectedRouteProps): React.ReactElement => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, isSuperAdmin } = usePermissions();

  // Si está cargando, mostrar loading (o podrías mostrar un spinner)
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  // Super admins tienen acceso a todo
  if (isSuperAdmin) {
    return children;
  }

  // Si hay un permiso único requerido
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return <Navigate to={routes.home} replace />;
    }
  }

  // Si hay múltiples permisos requeridos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAny
      ? hasAnyPermission(requiredPermissions)
      : hasAllPermissions(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to={routes.home} replace />;
    }
  }

  return children;
};

