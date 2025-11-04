import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../services/AuthService';

/**
 * Handler para cerrar sesión
 * @param event - Evento de API Gateway
 * @returns Respuesta de confirmación
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const token = event.headers.Authorization?.replace('Bearer ', '') ||
                  event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    const authService = new AuthService();
    const isValid = await authService.logout(token);

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Logout successful'
      })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};

