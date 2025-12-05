import { AppDataSource } from '../../../config/database';
import { Notification, NotificationStatus, NotificationType } from '../entities/Notification.entity';

/**
 * Repositorio para gestionar notificaciones en la base de datos
 */
export class NotificationRepository {
  private repository = AppDataSource.getRepository(Notification);

  /**
   * Crea una nueva notificación
   * @param notificationData - Datos de la notificación
   * @returns Notificación creada
   */
  async create(notificationData: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    quoteId?: string | null;
    codigoOrden?: string | null;
    clienteNombre?: string | null;
    vendedor?: string | null;
    estadoAnterior?: string | null;
    estadoNuevo?: string | null;
  }): Promise<Notification> {
    const notification = this.repository.create({
      ...notificationData,
      status: NotificationStatus.UNREAD
    });
    return await this.repository.save(notification);
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   * @param userId - ID del usuario
   * @param limit - Límite de resultados
   * @param offset - Offset para paginación
   * @returns Lista de notificaciones
   */
  async findByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Obtiene notificaciones no leídas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de notificaciones no leídas
   */
  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    return await this.repository.find({
      where: {
        userId,
        status: NotificationStatus.UNREAD
      },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene el conteo de notificaciones no leídas de un usuario
   * @param userId - ID del usuario
   * @returns Número de notificaciones no leídas
   */
  async countUnreadByUserId(userId: number): Promise<number> {
    return await this.repository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD
      }
    });
  }

  /**
   * Obtiene una notificación por ID
   * @param id - ID de la notificación
   * @returns Notificación encontrada o null
   */
  async findById(id: number): Promise<Notification | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  /**
   * Marca una notificación como leída
   * @param id - ID de la notificación
   * @param userId - ID del usuario (para validación)
   * @returns Notificación actualizada o null
   */
  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    const notification = await this.repository.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return null;
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    return await this.repository.save(notification);
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param userId - ID del usuario
   * @returns Número de notificaciones actualizadas
   */
  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.repository.update(
      {
        userId,
        status: NotificationStatus.UNREAD
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date()
      }
    );
    return result.affected || 0;
  }

  /**
   * Elimina una notificación
   * @param id - ID de la notificación
   * @param userId - ID del usuario (para validación)
   * @returns true si se eliminó, false si no se encontró
   */
  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.repository.delete({
      id,
      userId
    });
    return (result.affected || 0) > 0;
  }

  /**
   * Elimina todas las notificaciones leídas de un usuario
   * @param userId - ID del usuario
   * @returns Número de notificaciones eliminadas
   */
  async deleteReadByUserId(userId: number): Promise<number> {
    const result = await this.repository.delete({
      userId,
      status: NotificationStatus.READ
    });
    return result.affected || 0;
  }
}

