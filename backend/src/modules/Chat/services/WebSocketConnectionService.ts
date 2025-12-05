import { WebSocketConnectionRepository } from '../repositories/WebSocketConnectionRepository';
import { IWebSocketClient } from '../interfaces/IWebSocketClient';
import { AppDataSource } from '../../../config/database';

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
    // Asegurar que la base de datos esté inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return await this.connectionRepository.save(connectionId, userId);
  }

  /**
   * Elimina una conexión WebSocket
   * @param connectionId - ID de la conexión
   * @returns true si se eliminó correctamente
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    // Asegurar que la base de datos esté inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return await this.connectionRepository.delete(connectionId);
  }

  /**
   * Obtiene todas las conexiones activas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de connectionIds
   */
  async getUserConnections(userId: number): Promise<string[]> {
    // Asegurar que la base de datos esté inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
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

  /**
   * Envía un mensaje a todas las conexiones activas (broadcast)
   * Limpia automáticamente las conexiones que ya no existen
   * @param message - Mensaje a enviar
   * @returns Número total de conexiones a las que se envió el mensaje
   */
  async broadcast(message: unknown): Promise<number> {
    const allConnectionIds = await this.connectionRepository.findAllConnections();
    
    if (allConnectionIds.length === 0) {
      return 0;
    }

    // Enviar mensajes y obtener resultados
    const results = await Promise.allSettled(
      allConnectionIds.map(connectionId =>
        this.webSocketClient.sendToConnection(connectionId, message)
      )
    );

    // Contar conexiones exitosas y limpiar las que fallaron
    let sentCount = 0;
    const failedConnectionIds: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        sentCount++;
      } else {
        // Si falló, probablemente la conexión ya no existe
        failedConnectionIds.push(allConnectionIds[index]);
      }
    });

    // Limpiar conexiones que ya no existen (de forma asíncrona, no bloqueante)
    if (failedConnectionIds.length > 0) {
      console.log(`🧹 Limpiando ${failedConnectionIds.length} conexión(es) que ya no existen`);
      Promise.all(
        failedConnectionIds.map(connectionId =>
          this.connectionRepository.delete(connectionId).catch(error =>
            console.error(`Error limpiando conexión ${connectionId}:`, error)
          )
        )
      ).catch(error => {
        console.error('Error en limpieza de conexiones:', error);
      });
    }

    return sentCount;
  }
}

