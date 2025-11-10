import { type APIGatewayProxyWebsocketEventV2, type APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { WebSocketService } from '../../services/WebSocketService';
import { initializeDatabase } from '../../../../config/database';

/**
 * Handler para cuando un cliente se desconecta vía WebSocket
 * @param event - Evento de WebSocket disconnection
 * @returns Respuesta de desconexión
 */
export const handler: APIGatewayProxyWebsocketHandlerV2 = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  const connectionId = event.requestContext.connectionId;
  if (!connectionId) {
    return { statusCode: 400, body: 'Connection ID is required' };
  }

  // Eliminar conexión de forma asíncrona/no bloqueante
  (async () => {
    try {
      await initializeDatabase();
      const webSocketService = new WebSocketService();
      await webSocketService.deleteConnection(connectionId);
      console.log('Connection deleted:', connectionId);
    } catch (error) {
      console.error('Error deleting connection (non-blocking):', error);
    }
  })();

  // Retornar inmediatamente sin esperar la eliminación de la base de datos
  return { statusCode: 200, body: 'Disconnected' };
};

