import { apiClient } from '../api/client';
import type { Notification } from '../types/notifications';

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface MarkAsReadResponse {
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  count: number;
}

/**
 * Servicio para gestionar notificaciones
 */
export const notificationsService = {
  /**
   * Obtiene todas las notificaciones del usuario autenticado
   * @param limit - Límite de resultados
   * @param offset - Offset para paginación
   * @returns Respuesta con notificaciones
   */
  async getNotifications(limit: number = 50, offset: number = 0): Promise<GetNotificationsResponse> {
    const { data } = await apiClient.get<{ data: GetNotificationsResponse }>('/notifications', {
      params: { limit, offset }
    });
    return data.data;
  },

  /**
   * Marca una notificación como leída
   * @param notificationId - ID de la notificación
   * @returns Notificación actualizada
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    const { data } = await apiClient.put<{ data: MarkAsReadResponse }>(
      `/notifications/${notificationId}/read`
    );
    return data.data.notification;
  },

  /**
   * Marca todas las notificaciones como leídas
   * @returns Número de notificaciones actualizadas
   */
  async markAllAsRead(): Promise<number> {
    const { data } = await apiClient.put<{ data: MarkAllAsReadResponse }>(
      '/notifications/read-all'
    );
    return data.data.count;
  }
};

