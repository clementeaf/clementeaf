import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationType } from '../entities/Notification.entity';

/**
 * Servicio para gestionar notificaciones
 */
export class NotificationsService {
  private repository = new NotificationRepository();

  /**
   * Crea una notificación de Picking
   * @param userId - ID del usuario
   * @param data - Datos de la notificación
   * @returns Notificación creada
   */
  async createPickingNotification(
    userId: number,
    data: {
      quoteId: string;
      codigoOrden: string;
      clienteNombre: string;
      vendedor: string;
    }
  ) {
    return await this.repository.create({
      userId,
      type: NotificationType.PICKING,
      title: 'Nueva nota de venta',
      message: `Se ha generado una nueva nota de venta ${data.codigoOrden} para ${data.clienteNombre}`,
      quoteId: data.quoteId,
      codigoOrden: data.codigoOrden,
      clienteNombre: data.clienteNombre,
      vendedor: data.vendedor
    });
  }

  /**
   * Crea una notificación de Ventas
   * @param userId - ID del usuario
   * @param data - Datos de la notificación
   * @returns Notificación creada
   */
  async createSalesNotification(
    userId: number,
    data: {
      quoteId: string;
      codigoOrden: string;
      estadoAnterior: string;
      estadoNuevo: string;
      clienteNombre: string;
    }
  ) {
    return await this.repository.create({
      userId,
      type: NotificationType.SALES,
      title: 'Nota de venta actualizada',
      message: `La nota de venta ${data.codigoOrden} ha cambiado de "${data.estadoAnterior}" a "${data.estadoNuevo}"`,
      quoteId: data.quoteId,
      codigoOrden: data.codigoOrden,
      estadoAnterior: data.estadoAnterior,
      estadoNuevo: data.estadoNuevo,
      clienteNombre: data.clienteNombre
    });
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   * @param userId - ID del usuario
   * @param limit - Límite de resultados
   * @param offset - Offset para paginación
   * @returns Lista de notificaciones
   */
  async getUserNotifications(userId: number, limit: number = 50, offset: number = 0) {
    return await this.repository.findByUserId(userId, limit, offset);
  }

  /**
   * Obtiene el conteo de notificaciones no leídas de un usuario
   * @param userId - ID del usuario
   * @returns Número de notificaciones no leídas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.repository.countUnreadByUserId(userId);
  }

  /**
   * Marca una notificación como leída
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario
   * @returns Notificación actualizada o null
   */
  async markAsRead(notificationId: number, userId: number) {
    return await this.repository.markAsRead(notificationId, userId);
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param userId - ID del usuario
   * @returns Número de notificaciones actualizadas
   */
  async markAllAsRead(userId: number): Promise<number> {
    return await this.repository.markAllAsRead(userId);
  }

  /**
   * Elimina una notificación
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario
   * @returns true si se eliminó, false si no se encontró
   */
  async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
    return await this.repository.delete(notificationId, userId);
  }
}

