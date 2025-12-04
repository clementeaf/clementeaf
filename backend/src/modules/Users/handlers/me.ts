import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { UsersService } from '../services/UsersService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { extractToken, validateToken } from '../utils/auth';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para obtener información del usuario autenticado con rol y permisos
 * @param event - Evento de API Gateway
 * @returns Respuesta con datos del usuario, rol y permisos
 */
const meHandler = async (event: APIGatewayProxyEvent) => {
  const tokenError = validateToken(event);
  if (tokenError) return tokenError;

  const token = extractToken(event)!;
  
  try {
    const authService = new AuthService();
    const verifiedUser = await authService.verifyToken(token);

    // Obtener usuario completo con rol y permisos desde la base de datos
    const usersService = new UsersService();
    const user = await usersService.getUserById(verifiedUser.id, true);

    // Obtener permisos del rol si existe
    let permissions: string[] = [];
    if (user.role && user.role.rolePermissions) {
      permissions = user.role.rolePermissions
        .map(rp => rp.permission?.code)
        .filter((code): code is string => code !== undefined);
    }

    return successResponse(
      200,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
          isActive: user.role.isActive
        } : null,
        permissions,
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString()
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    console.error('Error verifying token:', errorMessage);
    console.error('Token received:', token.substring(0, 20) + '...');
    console.error('Cognito config:', {
      poolId: process.env.COGNITO_USER_POOL_ID ? 'configured' : 'missing',
      clientId: process.env.COGNITO_CLIENT_ID ? 'configured' : 'missing',
      region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'not set'
    });
    return errorResponse(401, errorMessage);
  }
};

export const handler = handlerWrapper(meHandler);

