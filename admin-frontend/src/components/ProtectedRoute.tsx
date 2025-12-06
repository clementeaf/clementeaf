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
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, isSuperAdmin, user } = usePermissions();

  // Si está cargando Y no hay usuario (ni siquiera optimista), mostrar loading
  // Si hay usuario optimista, permitir renderizar (los permisos se validarán cuando carguen)
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052C9] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
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

