import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { type LoginDto } from '../dto/LoginDto';
import { handlerWrapperWithoutDB } from '../utils/handlerWrapperWithoutDB';
import { validateBody, parseBody } from '../utils/validation';
import { validateLoginDto } from '../utils/validators';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para login de usuarios
 * @param event - Evento de API Gateway
 * @returns Respuesta con token JWT y datos del usuario
 */
const loginHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const loginDto = parseBody<LoginDto>(event.body!);
  if (!loginDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const validationError = validateLoginDto(loginDto);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const authService = new AuthService();
  const { token, refreshToken, user } = await authService.login(loginDto);

  return successResponse(
    200,
    {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString()
      }
    },
    'Login successful'
  );
};

export const handler = handlerWrapperWithoutDB(loginHandler);

