import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { initializeDatabase } from '../../../config/database';
import { AuthService } from '../services/AuthService';

/**
 * Handler para obtener información del usuario autenticado
 * @param event - Evento de API Gateway
 * @returns Respuesta con datos del usuario
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await initializeDatabase();

    const token = event.headers.Authorization?.replace('Bearer ', '') ||
                  event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    const authService = new AuthService();
    const user = await authService.verifyToken(token);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user
      })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    if (errorMessage.includes('Invalid token') || errorMessage.includes('Token')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};

