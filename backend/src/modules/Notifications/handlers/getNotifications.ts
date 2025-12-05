import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { NotificationsService } from '../services/NotificationsService';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para obtener notificaciones del usuario autenticado
 * @param event - Evento de API Gateway
 * @returns Respuesta con notificaciones
 */
const getNotificationsHandler = async (event: APIGatewayProxyEvent) => {
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

    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit || '50', 10);
    const offset = parseInt(queryParams.offset || '0', 10);

    const notificationsService = new NotificationsService();
    const notifications = await notificationsService.getUserNotifications(userId, limit, offset);
    const unreadCount = await notificationsService.getUnreadCount(userId);

    // Formatear notificaciones para el frontend
    const formattedNotifications = notifications.map(notif => ({
      id: notif.id,
      type: notif.type,
      status: notif.status,
      title: notif.title,
      message: notif.message,
      quoteId: notif.quoteId,
      codigoOrden: notif.codigoOrden,
      clienteNombre: notif.clienteNombre,
      vendedor: notif.vendedor,
      estadoAnterior: notif.estadoAnterior,
      estadoNuevo: notif.estadoNuevo,
      createdAt: notif.createdAt.toISOString(),
      readAt: notif.readAt?.toISOString() || null
    }));

    return successResponse(
      200,
      {
        notifications: formattedNotifications,
        unreadCount,
        total: notifications.length
      },
      'Notificaciones obtenidas exitosamente'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener notificaciones';
    console.error('Error en getNotifications:', errorMessage);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getNotificationsHandler);

