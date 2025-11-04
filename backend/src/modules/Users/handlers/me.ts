import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { extractToken, validateToken } from '../utils/auth';
import { successResponse } from '../utils/response';

/**
 * Handler para obtener información del usuario autenticado
 * @param event - Evento de API Gateway
 * @returns Respuesta con datos del usuario
 */
const meHandler = async (event: APIGatewayProxyEvent) => {
  const tokenError = validateToken(event);
  if (tokenError) return tokenError;

  const token = extractToken(event)!;
  const authService = new AuthService();
  const user = await authService.verifyToken(token);

  return successResponse(
    200,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    }
  );
};

export const handler = handlerWrapper(meHandler);

