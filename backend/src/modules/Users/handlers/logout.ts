import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { extractToken, validateToken } from '../utils/auth';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para cerrar sesión
 * @param event - Evento de API Gateway
 * @returns Respuesta de confirmación
 */
const logoutHandler = async (event: APIGatewayProxyEvent) => {
  const tokenError = validateToken(event);
  if (tokenError) return tokenError;

  const token = extractToken(event)!;
  const authService = new AuthService();
  const isValid = await authService.logout(token);

  if (!isValid) {
    return errorResponse(401, 'Invalid token');
  }

  return successResponse(200, undefined, 'Logout successful');
};

export const handler = handlerWrapper(logoutHandler);

