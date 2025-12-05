import { WebSocketConnectionService } from './WebSocketConnectionService';
import { resolveWebSocketEndpoint } from '../utils/websocket/WebSocketEndpointResolver';
import { AwsWebSocketClient } from './aws/AwsWebSocketClient';

/**
 * Servicio para gestionar conexiones WebSocket y envío de mensajes
 * @deprecated Este servicio se mantiene por compatibilidad. 
 * Para nuevo código, usar WebSocketConnectionService y WebSocketMessageService directamente.
 */
export class WebSocketService {
  private connectionService: WebSocketConnectionService;
  private endpoint: string;

  constructor(requestContext?: { domainName?: string; stage?: string }) {
    this.endpoint = resolveWebSocketEndpoint(requestContext);
    const webSocketClient = new AwsWebSocketClient(
      this.endpoint,
      process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
    );
    this.connectionService = new WebSocketConnectionService(webSocketClient);
  }

  /**
   * Guarda una conexión WebSocket en PostgreSQL
   * @param connectionId - ID de la conexión WebSocket
   * @param userId - ID del usuario
   * @returns true si se guardó correctamente
   */
  async saveConnection(connectionId: string, userId: number): Promise<boolean> {
    return await this.connectionService.saveConnection(connectionId, userId);
  }

  /**
   * Elimina una conexión WebSocket de PostgreSQL
   * @param connectionId - ID de la conexión WebSocket
   * @returns true si se eliminó correctamente
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    return await this.connectionService.deleteConnection(connectionId);
  }

  /**
   * Obtiene todas las conexiones activas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de connectionIds
   */
  async getUserConnections(userId: number): Promise<string[]> {
    return await this.connectionService.getUserConnections(userId);
  }

  /**
   * Obtiene el connectionId de un usuario específico
   * @param userId - ID del usuario
   * @returns connectionId o null
   */
  async getUserConnection(userId: number): Promise<string | null> {
    const connections = await this.getUserConnections(userId);
    return connections.length > 0 ? connections[0] : null;
  }

  /**
   * Envía un mensaje a una conexión WebSocket específica
   * @param connectionId - ID de la conexión WebSocket
   * @param message - Mensaje a enviar
   * @returns true si se envió correctamente
   */
  async sendToConnection(connectionId: string, message: unknown): Promise<boolean> {
    const webSocketClient = new AwsWebSocketClient(
      this.endpoint,
      process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
    );
    return await webSocketClient.sendToConnection(connectionId, message);
  }

  /**
   * Envía un mensaje a todos los participantes de una conversación
   * @param participant1Id - ID del primer participante
   * @param participant2Id - ID del segundo participante
   * @param message - Mensaje a enviar
   * @returns Número de conexiones a las que se envió el mensaje
   */
  async sendToConversationParticipants(
    participant1Id: number,
    participant2Id: number,
    message: unknown
  ): Promise<number> {
    return await this.connectionService.sendToUsers([participant1Id, participant2Id], message);
  }
}
