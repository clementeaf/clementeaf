import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AuthService } from '../services/AuthService';
import { type RefreshTokenDto } from '../dto/RefreshTokenDto';
import { handlerWrapper } from '../utils/handlerWrapper';
import { validateBody, parseBody } from '../utils/validation';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para refrescar el access token
 * @param event - Evento de API Gateway
 * @returns Respuesta con nuevo token JWT y refresh token
 */
const refreshTokenHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const refreshTokenDto = parseBody<RefreshTokenDto>(event.body!);
  if (!refreshTokenDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  if (!refreshTokenDto.refreshToken) {
    return errorResponse(400, 'Refresh token is required');
  }

  try {
    const authService = new AuthService();
    const { token, refreshToken, user } = await authService.refreshToken(refreshTokenDto.refreshToken);

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
      'Token refreshed successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid refresh token';
    return errorResponse(401, errorMessage);
  }
};

export const handler = handlerWrapper(refreshTokenHandler);

