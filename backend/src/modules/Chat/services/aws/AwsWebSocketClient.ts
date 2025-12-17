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
   * Obtiene el timeout en ms para envíos WebSocket.
   * @returns Timeout en milisegundos
   */
  private getSendTimeoutMs(): number {
    const raw = process.env.WEBSOCKET_SEND_TIMEOUT_MS;
    const parsed = raw ? parseInt(raw, 10) : 1500;
    if (Number.isNaN(parsed) || parsed < 100 || parsed > 10000) return 1500;
    return parsed;
  }

  /**
   * Envía un mensaje a una conexión WebSocket específica
   * @param connectionId - ID de la conexión
   * @param message - Mensaje a enviar
   * @returns true si se envió correctamente, false en caso contrario
   */
  async sendToConnection(connectionId: string, message: unknown): Promise<boolean> {
    const controller = new AbortController();
    const timeoutMs = this.getSendTimeoutMs();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await this.apiGatewayClient.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: JSON.stringify(message)
        }),
        { abortSignal: controller.signal }
      );
      return true;
    } catch (error) {
      // Timeout: típico cuando la Lambda está en VPC sin salida a Internet/NAT
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`⚠️ Timeout enviando WebSocket a conexión ${connectionId} (${timeoutMs}ms)`);
        return false;
      }
      // Si la conexión ya no existe (GoneException), no es un error crítico
      if (error instanceof Error && (error.name === 'GoneException' || error.name === '410')) {
        console.log(`⚠️ Conexión ${connectionId} ya no existe, será limpiada automáticamente`);
        // La conexión será limpiada en el siguiente $disconnect o por limpieza periódica
        return false;
      }
      
      console.error(`❌ Error enviando mensaje a conexión ${connectionId}:`, error);
      return false;
    } finally {
      clearTimeout(timeoutId);
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

