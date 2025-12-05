import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { NotificationsService } from '../services/NotificationsService';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para marcar una notificación como leída
 * @param event - Evento de API Gateway
 * @returns Respuesta con notificación actualizada
 */
const markAsReadHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return errorResponse(401, 'Token de autenticación requerido');
    }

    const token = authHeader.replace('Bearer ', '');
    const authService = new AuthService();
    const decoded = await authService.verifyToken(token);

    if (!decoded || !decoded.sub) {
      return errorResponse(401, 'Token inválido');
    }

    const userId = parseInt(decoded.sub, 10);
    if (isNaN(userId)) {
      return errorResponse(401, 'ID de usuario inválido');
    }

    const notificationId = event.pathParameters?.id;
    if (!notificationId) {
      return errorResponse(400, 'ID de notificación requerido');
    }

    const id = parseInt(notificationId, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'ID de notificación inválido');
    }

    const notificationsService = new NotificationsService();
    const notification = await notificationsService.markAsRead(id, userId);

    if (!notification) {
      return errorResponse(404, 'Notificación no encontrada');
    }

    return successResponse(
      200,
      { notification },
      'Notificación marcada como leída'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al marcar notificación como leída';
    console.error('Error en markAsRead:', errorMessage);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(markAsReadHandler);

