import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { UsersService } from '../services/UsersService';
import { extractToken, validateToken } from './auth';
import { errorResponse } from './response';
import { isSuperAdmin } from '../../../config/superAdmins';

/**
 * Usuario con permisos para validación
 */
export interface UserWithPermissions {
  id: number;
  email: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

/**
 * Obtiene el usuario autenticado con sus permisos
 * @param event - Evento de API Gateway
 * @returns Usuario con permisos o null si no está autenticado
 */
export const getUserWithPermissions = async (event: APIGatewayProxyEvent): Promise<UserWithPermissions | null> => {
  const tokenError = validateToken(event);
  if (tokenError) {
    return null;
  }

  const token = extractToken(event);
  if (!token) {
    return null;
  }

  try {
    const authService = new AuthService();
    const verifiedUser = await authService.verifyToken(token);

    const usersService = new UsersService();
    let user;
    try {
      user = await usersService.getUserByEmail(verifiedUser.email, true);
    } catch (error) {
      // Si el usuario no existe, no tiene permisos
      if (error instanceof Error && error.message === 'Usuario no encontrado') {
        return null;
      }
      throw error;
    }

    // Obtener permisos del rol
    let permissions: string[] = [];
    if (user.role && user.role.rolePermissions) {
      permissions = user.role.rolePermissions
        .map(rp => rp.permission?.code)
        .filter((code): code is string => code !== undefined);
    }

    return {
      id: user.id,
      email: user.email,
      permissions,
      isSuperAdmin: isSuperAdmin(user.email)
    };
  } catch (error) {
    console.error('Error obteniendo usuario con permisos:', error);
    return null;
  }
};

/**
 * Valida que el usuario tenga un permiso específico
 * @param event - Evento de API Gateway
 * @param requiredPermission - Permiso requerido
 * @returns Error response si no tiene permiso, null si es válido
 */
export const validatePermission = async (
  event: APIGatewayProxyEvent,
  requiredPermission: string
): Promise<ReturnType<typeof errorResponse> | null> => {
  const user = await getUserWithPermissions(event);
  
  if (!user) {
    return errorResponse(401, 'No autenticado o token inválido');
  }

  // Super admins tienen acceso a todo
  if (user.isSuperAdmin) {
    return null;
  }

  // Verificar si tiene el permiso
  if (!user.permissions.includes(requiredPermission)) {
    return errorResponse(403, `No tienes permiso para realizar esta acción. Se requiere: ${requiredPermission}`);
  }

  return null;
};

/**
 * Valida que el usuario tenga al menos uno de los permisos especificados
 * @param event - Evento de API Gateway
 * @param requiredPermissions - Array de permisos requeridos
 * @returns Error response si no tiene ningún permiso, null si es válido
 */
export const validateAnyPermission = async (
  event: APIGatewayProxyEvent,
  requiredPermissions: string[]
): Promise<ReturnType<typeof errorResponse> | null> => {
  const user = await getUserWithPermissions(event);
  
  if (!user) {
    return errorResponse(401, 'No autenticado o token inválido');
  }

  // Super admins tienen acceso a todo
  if (user.isSuperAdmin) {
    return null;
  }

  // Verificar si tiene al menos uno de los permisos
  const hasPermission = requiredPermissions.some(permission => user.permissions.includes(permission));
  
  if (!hasPermission) {
    return errorResponse(403, `No tienes permiso para realizar esta acción. Se requiere uno de: ${requiredPermissions.join(', ')}`);
  }

  return null;
};

