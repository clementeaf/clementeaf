import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { NotificationsService } from '../services/NotificationsService';
import { AuthService } from '../../Users/services/AuthService';
import { UsersService } from '../../Users/services/UsersService';

/**
 * Handler para marcar todas las notificaciones como leídas
 * @param event - Evento de API Gateway
 * @returns Respuesta con número de notificaciones actualizadas
 */
const markAllAsReadHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return errorResponse(401, 'Token de autenticación requerido');
    }

    const token = authHeader.replace('Bearer ', '');
    const authService = new AuthService();
    const verifiedUser = await authService.verifyToken(token);

    // Obtener usuario completo desde la base de datos para obtener el ID
    const usersService = new UsersService();
    const user = await usersService.getOrCreateUserByEmail(verifiedUser.email, false, verifiedUser.name ?? null);

    const userId = user.id;

    const notificationsService = new NotificationsService();
    const count = await notificationsService.markAllAsRead(userId);

    return successResponse(
      200,
      { count },
      `${count} notificación(es) marcada(s) como leída(s)`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al marcar todas las notificaciones como leídas';
    console.error('Error en markAllAsRead:', errorMessage);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(markAllAsReadHandler);

