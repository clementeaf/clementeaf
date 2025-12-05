import { IWebSocketClient } from '../interfaces/IWebSocketClient';

/**
 * Implementación mock de IWebSocketClient para desarrollo local
 * No envía mensajes reales, solo los registra en consola
 */
export class LocalWebSocketClient implements IWebSocketClient {
  /**
   * Envía un mensaje a una conexión WebSocket específica (mock)
   * @param connectionId - ID de la conexión
   * @param message - Mensaje a enviar
   * @returns true siempre (mock)
   */
  async sendToConnection(connectionId: string, message: unknown): Promise<boolean> {
    console.log(`🔧 [LOCAL WS] Mock: Enviando mensaje a conexión ${connectionId}:`, JSON.stringify(message, null, 2));
    return true;
  }

  /**
   * Envía un mensaje a múltiples conexiones (mock)
   * @param connectionIds - Array de IDs de conexión
   * @param message - Mensaje a enviar
   * @returns Número de conexiones (mock)
   */
  async sendToConnections(connectionIds: string[], message: unknown): Promise<number> {
    console.log(`🔧 [LOCAL WS] Mock: Enviando mensaje a ${connectionIds.length} conexión(es):`, JSON.stringify(message, null, 2));
    return connectionIds.length;
  }
}

