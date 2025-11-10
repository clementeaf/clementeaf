import { AppDataSource } from '../../../config/database';
import { WebSocketConnection } from '../entities/WebSocketConnection.entity';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

/**
 * Obtiene el endpoint de WebSocket Management API desde el evento de API Gateway
 * Para WebSocket Management API, necesitamos el endpoint HTTP (https://), no WSS
 * @param requestContext - Request context del evento de API Gateway
 * @returns Endpoint de WebSocket Management API
 */
const getWebSocketEndpoint = (requestContext?: { domainName?: string; stage?: string }): string => {
  // Si se proporciona requestContext, construir el endpoint dinámicamente
  if (requestContext?.domainName && requestContext?.stage) {
    return `https://${requestContext.domainName}/${requestContext.stage}`;
  }
  
  // Fallback a variables de entorno
  if (process.env.WEBSOCKET_API_ENDPOINT) {
    return process.env.WEBSOCKET_API_ENDPOINT;
  }
  
  const wssEndpoint = process.env.WSS_ENDPOINT;
  if (wssEndpoint) {
    return wssEndpoint.replace('wss://', 'https://');
  }
  
  // Fallback hardcodeado (solo para desarrollo)
  return 'https://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev';
};

/**
 * Servicio para gestionar conexiones WebSocket y envío de mensajes
 */
export class WebSocketService {
  private apiGatewayEndpoint: string;
  private apiGatewayClient: ApiGatewayManagementApiClient | null;

  constructor(requestContext?: { domainName?: string; stage?: string }) {
    this.apiGatewayEndpoint = getWebSocketEndpoint(requestContext);
    this.apiGatewayClient = new ApiGatewayManagementApiClient({
      endpoint: this.apiGatewayEndpoint,
      region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
    });
  }

  private get connectionRepository() {
    return AppDataSource.getRepository(WebSocketConnection);
  }

  /**
   * Guarda una conexión WebSocket en PostgreSQL
   * @param connectionId - ID de la conexión WebSocket
   * @param userId - ID del usuario
   * @returns true si se guardó correctamente
   */
  async saveConnection(connectionId: string, userId: number): Promise<boolean> {
    try {
      const connection = this.connectionRepository.create({
        connectionId,
        userId
      } as WebSocketConnection);
      
      await this.connectionRepository.save(connection);
      return true;
    } catch (error) {
      console.error('Error guardando conexión:', error);
      return false;
    }
  }

  /**
   * Elimina una conexión WebSocket de PostgreSQL
   * @param connectionId - ID de la conexión WebSocket
   * @returns true si se eliminó correctamente
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      await this.connectionRepository.delete({ connectionId });
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
  async getUserConnections(userId: number): Promise<string[]> {
    try {
      const connections = await this.connectionRepository.find({
        where: { userId }
      });

      return connections.map(conn => conn.connectionId);
    } catch (error) {
      console.error('Error obteniendo conexiones del usuario:', error);
      return [];
    }
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
    if (!this.apiGatewayClient) {
      console.error('API Gateway Management API client no configurado');
      console.error(`Endpoint configurado: ${this.apiGatewayEndpoint}`);
      return false;
    }

    try {
      console.log(`Enviando mensaje a conexión ${connectionId} usando endpoint: ${this.apiGatewayEndpoint}`);
      await this.apiGatewayClient.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: JSON.stringify(message)
        })
      );
      console.log(`✅ Mensaje enviado exitosamente a conexión ${connectionId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando mensaje a conexión ${connectionId}:`, error);
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}, message: ${error.message}`);
      }
      // Si la conexión ya no existe, la eliminamos de PostgreSQL
      if (error instanceof Error && (error.name === 'GoneException' || error.name === '410')) {
        console.log(`Conexión ${connectionId} ya no existe, eliminando de PostgreSQL`);
        await this.deleteConnection(connectionId);
      }
      return false;
    }
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
    console.log(`📤 Enviando mensaje vía WebSocket a participantes: ${participant1Id}, ${participant2Id}`);
    console.log(`🔗 Endpoint de WebSocket Management API: ${this.apiGatewayEndpoint}`);
    
    try {
      const connections1 = await this.getUserConnections(participant1Id);
      const connections2 = await this.getUserConnections(participant2Id);

      console.log(`🔌 Conexiones del usuario ${participant1Id}:`, connections1);
      console.log(`🔌 Conexiones del usuario ${participant2Id}:`, connections2);

      const allConnections = [...connections1, ...connections2];
      console.log(`📊 Total de conexiones a enviar: ${allConnections.length}`);
      
      if (allConnections.length === 0) {
        console.log(`⚠️ No hay conexiones activas para los participantes`);
        return 0;
      }
      
      let sentCount = 0;

      // Enviar mensajes en paralelo para mejor rendimiento
      const sendPromises = allConnections.map(async (connectionId) => {
        console.log(`📨 Enviando mensaje a conexión: ${connectionId}`);
        const sent = await this.sendToConnection(connectionId, message);
        if (sent) {
          console.log(`✅ Mensaje enviado a conexión: ${connectionId}`);
          sentCount++;
        } else {
          console.log(`❌ Error enviando mensaje a conexión: ${connectionId}`);
        }
      });

      await Promise.allSettled(sendPromises);

      console.log(`✅ Total de mensajes enviados: ${sentCount}/${allConnections.length}`);
      return sentCount;
    } catch (error) {
      console.error(`❌ Error en sendToConversationParticipants:`, error);
      return 0;
    }
  }
}

