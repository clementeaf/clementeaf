import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { initializeDatabase } from '../../../config/database';
import { AuthService } from '../services/AuthService';
import { type RegisterDto } from '../dto/RegisterDto';

/**
 * Handler para registro de usuarios
 * @param event - Evento de API Gateway
 * @returns Respuesta con usuario creado
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

    const registerDto: RegisterDto = JSON.parse(event.body);

    if (!registerDto.email || !registerDto.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    const authService = new AuthService();
    const user = await authService.register(registerDto);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt?.toISOString(),
          updatedAt: user.updatedAt?.toISOString()
        }
      })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    if (errorMessage.includes('already exists')) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};

