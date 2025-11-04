import { type APIGatewayProxyEvent } from 'aws-lambda';
import { errorResponse } from './response';

/**
 * Extrae el token JWT de los headers de la petición
 * @param event - Evento de API Gateway
 * @returns Token JWT o null si no existe
 */
export const extractToken = (event: APIGatewayProxyEvent): string | null => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  return token || null;
};

/**
 * Valida que exista un token en los headers
 * @param event - Evento de API Gateway
 * @returns Error response si no hay token, null si es válido
 */
export const validateToken = (event: APIGatewayProxyEvent) => {
  const token = extractToken(event);
  if (!token) {
    return errorResponse(401, 'Token is required');
  }
  return null;
};

