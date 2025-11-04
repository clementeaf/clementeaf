import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { type RegisterDto } from '../dto/RegisterDto';
import { handlerWrapper } from '../utils/handlerWrapper';
import { validateBody, parseBody } from '../utils/validation';
import { validateRegisterDto } from '../utils/validators';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para registro de usuarios
 * @param event - Evento de API Gateway
 * @returns Respuesta con usuario creado
 */
const registerHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const registerDto = parseBody<RegisterDto>(event.body!);
  if (!registerDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const validationError = validateRegisterDto(registerDto);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const authService = new AuthService();
  const user = await authService.register(registerDto);

  return successResponse(
    201,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    },
    'User registered successfully'
  );
};

export const handler = handlerWrapper(registerHandler);

