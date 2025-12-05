import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { IWebSocketClient } from '../../interfaces/IWebSocketClient';

/**
 * Implementación de IWebSocketClient usando AWS API Gateway Management API
 */
export class AwsWebSocketClient implements IWebSocketClient {
  private apiGatewayClient: ApiGatewayManagementApiClient;
  private endpoint: string;

  constructor(endpoint: string, region: string = 'us-east-1') {
    this.endpoint = endpoint;
    this.apiGatewayClient = new ApiGatewayManagementApiClient({
      endpoint,
      region
    });
  }

  /**
   * Envía un mensaje a una conexión WebSocket específica
   * @param connectionId - ID de la conexión
   * @param message - Mensaje a enviar
   * @returns true si se envió correctamente, false en caso contrario
   */
  async sendToConnection(connectionId: string, message: unknown): Promise<boolean> {
    try {
      await this.apiGatewayClient.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: JSON.stringify(message)
        })
      );
      return true;
    } catch (error) {
      console.error(`Error enviando mensaje a conexión ${connectionId}:`, error);
      
      // Si la conexión ya no existe (GoneException), retornar false
      // El servicio que llama debe manejar la eliminación de la conexión
      if (error instanceof Error && (error.name === 'GoneException' || error.name === '410')) {
        console.log(`Conexión ${connectionId} ya no existe`);
      }
      
      return false;
    }
  }

  /**
   * Envía un mensaje a múltiples conexiones
   * @param connectionIds - Array de IDs de conexión
   * @param message - Mensaje a enviar
   * @returns Número de conexiones a las que se envió el mensaje
   */
  async sendToConnections(connectionIds: string[], message: unknown): Promise<number> {
    if (connectionIds.length === 0) {
      return 0;
    }

    const sendPromises = connectionIds.map(connectionId =>
      this.sendToConnection(connectionId, message)
    );

    const results = await Promise.allSettled(sendPromises);
    const sentCount = results.filter(result => result.status === 'fulfilled' && result.value).length;

    return sentCount;
  }

  /**
   * Obtiene el endpoint configurado
   * @returns Endpoint de WebSocket Management API
   */
  getEndpoint(): string {
    return this.endpoint;
  }
}

