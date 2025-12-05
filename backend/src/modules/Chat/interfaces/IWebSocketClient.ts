/**
 * Interfaz para abstraer el cliente de WebSocket (AWS API Gateway)
 * Permite cambiar la implementación sin afectar el resto del código
 */
export interface IWebSocketClient {
  /**
   * Envía un mensaje a una conexión WebSocket específica
   * @param connectionId - ID de la conexión
   * @param message - Mensaje a enviar
   * @returns true si se envió correctamente, false en caso contrario
   */
  sendToConnection(connectionId: string, message: unknown): Promise<boolean>;

  /**
   * Envía un mensaje a múltiples conexiones
   * @param connectionIds - Array de IDs de conexión
   * @param message - Mensaje a enviar
   * @returns Número de conexiones a las que se envió el mensaje
   */
  sendToConnections(connectionIds: string[], message: unknown): Promise<number>;
}

