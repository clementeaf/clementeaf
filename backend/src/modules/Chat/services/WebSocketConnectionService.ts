import { WebSocketConnectionRepository } from '../repositories/WebSocketConnectionRepository';
import { IWebSocketClient } from '../interfaces/IWebSocketClient';

/**
 * Servicio para gestionar conexiones WebSocket
 * Separa la lógica de negocio del acceso a datos
 */
export class WebSocketConnectionService {
  private connectionRepository: WebSocketConnectionRepository;
  private webSocketClient: IWebSocketClient;

  constructor(webSocketClient: IWebSocketClient) {
    this.connectionRepository = new WebSocketConnectionRepository();
    this.webSocketClient = webSocketClient;
  }

  /**
   * Guarda una conexión WebSocket
   * @param connectionId - ID de la conexión
   * @param userId - ID del usuario
   * @returns true si se guardó correctamente
   */
  async saveConnection(connectionId: string, userId: number): Promise<boolean> {
    return await this.connectionRepository.save(connectionId, userId);
  }

  /**
   * Elimina una conexión WebSocket
   * @param connectionId - ID de la conexión
   * @returns true si se eliminó correctamente
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    return await this.connectionRepository.delete(connectionId);
  }

  /**
   * Obtiene todas las conexiones activas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de connectionIds
   */
  async getUserConnections(userId: number): Promise<string[]> {
    return await this.connectionRepository.findByUserId(userId);
  }

  /**
   * Obtiene el userId asociado a una conexión
   * @param connectionId - ID de la conexión
   * @returns userId o null si no existe
   */
  async getUserIdFromConnection(connectionId: string): Promise<number | null> {
    return await this.connectionRepository.findUserIdByConnectionId(connectionId);
  }

  /**
   * Envía un mensaje a todas las conexiones de un usuario
   * @param userId - ID del usuario
   * @param message - Mensaje a enviar
   * @returns Número de conexiones a las que se envió el mensaje
   */
  async sendToUser(userId: number, message: unknown): Promise<number> {
    const connectionIds = await this.getUserConnections(userId);
    if (connectionIds.length === 0) {
      return 0;
    }

    return await this.webSocketClient.sendToConnections(connectionIds, message);
  }

  /**
   * Envía un mensaje a múltiples usuarios
   * @param userIds - Array de IDs de usuarios
   * @param message - Mensaje a enviar
   * @returns Número total de conexiones a las que se envió el mensaje
   */
  async sendToUsers(userIds: number[], message: unknown): Promise<number> {
    const connectionMap = await this.connectionRepository.findByUserIds(userIds);
    
    const allConnectionIds: string[] = [];
    connectionMap.forEach(connectionIds => {
      allConnectionIds.push(...connectionIds);
    });

    if (allConnectionIds.length === 0) {
      return 0;
    }

    return await this.webSocketClient.sendToConnections(allConnectionIds, message);
  }
}

