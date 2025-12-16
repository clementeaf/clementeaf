import { APIGatewayProxyEvent } from 'aws-lambda';

import { getUserWithPermissions } from '../../Users/utils/permissions';

/**
 * Middleware para verificar si un usuario tiene una capability específica
 */
export const checkCapability = async (
  event: APIGatewayProxyEvent
): Promise<{ authorized: boolean; message?: string }> => {
  try {
    const user = await getUserWithPermissions(event);

    if (!user) {
      return {
        authorized: false,
        message: 'Usuario no autenticado'
      };
    }

    // Para verificar capabilities, necesitamos un servicio que obtenga el rol completo
    // Esta función se usará principalmente para verificar permisos en endpoints específicos
    return { authorized: true }; // Por ahora permitimos continuar, la verificación real será en el handler
  } catch (error) {
    console.error('Error checking capability:', error);
    return {
      authorized: false,
      message: 'Error al verificar permisos'
    };
  }
};

/**
 * Verifica si el usuario puede delegar permisos (crear subalternos)
 */
export const canDelegate = async (
  event: APIGatewayProxyEvent
): Promise<{ authorized: boolean; message?: string }> => {
  try {
    const user = await getUserWithPermissions(event);

    if (!user) {
      return {
        authorized: false,
        message: 'Usuario no autorizado'
      };
    }

    // Verificar si es super admin (puede delegar siempre)
    if (user.isSuperAdmin) {
      return { authorized: true };
    }

    // Para usuarios normales, verificar capability específica
    return { authorized: true }; // Permitir continuar, la verificación real será en el handler
  } catch (error) {
    console.error('Error checking delegation permission:', error);
    return {
      authorized: false,
      message: 'Error al verificar permisos de delegación'
    };
  }
};

/**
 * Verifica si el módulo está en el alcance del rol
 */
export const hasModuleAccess = async (
  event: APIGatewayProxyEvent
): Promise<{ authorized: boolean; message?: string }> => {
  try {
    const user = await getUserWithPermissions(event);

    if (!user) {
      return {
        authorized: false,
        message: 'Usuario no autorizado'
      };
    }

    // Super admins tienen acceso a todos los módulos
    if (user.isSuperAdmin) {
      return { authorized: true };
    }

    // Para usuarios normales, permitir continuar
    return { authorized: true }; // Permitir continuar, la verificación real será en el handler
  } catch (error) {
    console.error('Error checking module access:', error);
    return {
      authorized: false,
      message: 'Error al verificar acceso al módulo'
    };
  }
};
