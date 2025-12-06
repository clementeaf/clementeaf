import { useMemo } from 'react';
import { useCurrentUser } from './useAuth';
import { isSuperAdmin } from '../config/superAdmins';

/**
 * Hook para gestionar permisos del usuario autenticado
 * @returns Objeto con permisos y funciones de verificación
 */
export const usePermissions = () => {
  const { data: user, isLoading, isPlaceholderData = false } = useCurrentUser();

  /**
   * Verifica si el usuario actual es super administrador
   */
  const isUserSuperAdmin = useMemo(() => {
    return isSuperAdmin(user?.email);
  }, [user?.email]);

  /**
   * Si estamos usando datos optimistas, considerar que aún está cargando permisos
   * pero permitir renderizar la UI básica
   */
  const isActuallyLoading = isLoading && !isPlaceholderData;

  /**
   * Lista de códigos de permisos del usuario
   */
  const permissions = useMemo(() => {
    const userPermissions = user?.permissions || [];
    
    // Log de permisos cuando se cargan (solo si no son datos optimistas)
    if (user && !isActuallyLoading && !isPlaceholderData && user.permissions.length > 0) {
      const isAdmin = isSuperAdmin(user.email);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 [PERMISSIONS] Permisos del usuario cargados:', {
          userId: user.id,
          email: user.email,
          roleName: user.role?.name || 'Sin rol',
          isSuperAdmin: isAdmin,
          permissionsCount: userPermissions.length,
          permissions: isAdmin ? 'SUPER ADMIN - Acceso completo' : (userPermissions.length > 0 ? userPermissions : 'Sin permisos asignados')
        });
      }
    }
    
    return userPermissions;
  }, [user?.permissions, user, isLoading]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permissionCode - Código del permiso a verificar
   * @returns true si el usuario tiene el permiso o es super admin
   */
  const hasPermission = (permissionCode: string): boolean => {
    // Super admins tienen acceso a todo
    if (isUserSuperAdmin) return true;
    
    if (!permissions.length) return false;
    return permissions.includes(permissionCode);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param permissionCodes - Array de códigos de permisos
   * @returns true si el usuario tiene al menos uno de los permisos o es super admin
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    // Super admins tienen acceso a todo
    if (isUserSuperAdmin) return true;
    
    if (!permissions.length) return false;
    return permissionCodes.some(code => permissions.includes(code));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param permissionCodes - Array de códigos de permisos
   * @returns true si el usuario tiene todos los permisos o es super admin
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    // Super admins tienen acceso a todo
    if (isUserSuperAdmin) return true;
    
    if (!permissions.length) return false;
    return permissionCodes.every(code => permissions.includes(code));
  };

  /**
   * Verifica si el usuario tiene acceso a un módulo
   * Un usuario tiene acceso si tiene el permiso del módulo o al menos un permiso de submódulo
   * @param moduleCode - Código del módulo (ej: 'module:ventas')
   * @param subModuleCodes - Array de códigos de submódulos (ej: ['view:/clients', 'view:/quotes'])
   * @returns true si el usuario tiene acceso al módulo o es super admin
   */
  const hasModuleAccess = (moduleCode: string, subModuleCodes: string[] = []): boolean => {
    // Super admins tienen acceso a todo
    if (isUserSuperAdmin) return true;
    
    // Si tiene el permiso del módulo completo, tiene acceso
    if (hasPermission(moduleCode)) {
      return true;
    }

    // Si tiene al menos un permiso de submódulo, tiene acceso
    if (subModuleCodes.length > 0 && hasAnyPermission(subModuleCodes)) {
      return true;
    }

    return false;
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    isLoading: isActuallyLoading,
    user,
    isSuperAdmin: isUserSuperAdmin
  };
};

