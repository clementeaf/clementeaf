import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { handlerWrapperWithoutDB } from '../utils/handlerWrapperWithoutDB';
import { extractToken, validateToken } from '../utils/auth';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para obtener información del usuario autenticado con rol y permisos
 * @param event - Evento de API Gateway
 * @returns Respuesta con datos del usuario, rol y permisos
 */
const meHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const tokenError = validateToken(event);
  if (tokenError) return tokenError;

  const token = extractToken(event)!;
  
  try {
    const authService = new AuthService();
    const verifiedUser = await authService.verifyToken(token);

    return successResponse(
      200,
      {
        id: 0,
        email: verifiedUser.email,
        name: verifiedUser.name,
        role: null,
        permissions: [],
        createdAt: verifiedUser.createdAt?.toISOString(),
        updatedAt: verifiedUser.updatedAt?.toISOString()
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

export const handler = handlerWrapperWithoutDB(meHandler);

