import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { initializeDatabase } from '../../../config/database';
import { AuthService } from '../services/AuthService';
import { type LoginDto } from '../dto/LoginDto';

/**
 * Handler para login de usuarios
 * @param event - Evento de API Gateway
 * @returns Respuesta con token JWT y datos del usuario
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await initializeDatabase();

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const loginDto: LoginDto = JSON.parse(event.body);

    if (!loginDto.email || !loginDto.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    const authService = new AuthService();
    const { token, user } = await authService.login(loginDto);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user
      })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    if (errorMessage.includes('Invalid credentials')) {
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

