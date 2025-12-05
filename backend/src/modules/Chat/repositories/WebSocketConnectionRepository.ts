import { AppDataSource } from '../../../config/database';
import { WebSocketConnection } from '../entities/WebSocketConnection.entity';

/**
 * Repositorio para gestionar conexiones WebSocket
 * Abstrae el acceso a la base de datos
 */
export class WebSocketConnectionRepository {
  private get repository() {
    return AppDataSource.getRepository(WebSocketConnection);
  }

  /**
   * Guarda una conexión WebSocket
   * @param connectionId - ID de la conexión
   * @param userId - ID del usuario
   * @returns true si se guardó correctamente
   */
  async save(connectionId: string, userId: number): Promise<boolean> {
    try {
      const connection = this.repository.create({
        connectionId,
        userId
      } as WebSocketConnection);
      
      await this.repository.save(connection);
      return true;
    } catch (error) {
      console.error('Error guardando conexión:', error);
      return false;
    }
  }

  /**
   * Elimina una conexión WebSocket
   * @param connectionId - ID de la conexión
   * @returns true si se eliminó correctamente
   */
  async delete(connectionId: string): Promise<boolean> {
    try {
      await this.repository.delete({ connectionId });
      return true;
    } catch (error) {
      console.error('Error eliminando conexión:', error);
      return false;
    }
  }

  /**
   * Obtiene todas las conexiones activas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de connectionIds
   */
  async findByUserId(userId: number): Promise<string[]> {
    try {
      const connections = await this.repository.find({
        where: { userId }
      });

      return connections.map(conn => conn.connectionId);
    } catch (error) {
      console.error('Error obteniendo conexiones del usuario:', error);
      return [];
    }
  }

  /**
   * Obtiene el userId asociado a una conexión
   * @param connectionId - ID de la conexión
   * @returns userId o null si no existe
   */
  async findUserIdByConnectionId(connectionId: string): Promise<number | null> {
    try {
      const connection = await this.repository.findOne({
        where: { connectionId }
      });

      return connection?.userId ?? null;
    } catch (error) {
      console.error('Error obteniendo userId de conexión:', error);
      return null;
    }
  }

  /**
   * Obtiene todas las conexiones activas de múltiples usuarios
   * @param userIds - Array de IDs de usuarios
   * @returns Mapa de userId -> connectionIds[]
   */
  async findByUserIds(userIds: number[]): Promise<Map<number, string[]>> {
    try {
      const connections = await this.repository.find({
        where: userIds.map(userId => ({ userId }))
      });

      const connectionMap = new Map<number, string[]>();
      connections.forEach(conn => {
        const existing = connectionMap.get(conn.userId) || [];
        existing.push(conn.connectionId);
        connectionMap.set(conn.userId, existing);
      });

      return connectionMap;
    } catch (error) {
      console.error('Error obteniendo conexiones de usuarios:', error);
      return new Map();
    }
  }
}

