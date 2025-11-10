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
  try {
    await initializeDatabase();
    
    const connectionId = event.requestContext.connectionId;
    if (!connectionId) {
      return { statusCode: 400, body: 'Connection ID is required' };
    }

    const webSocketService = new WebSocketService();
    await webSocketService.deleteConnection(connectionId);

    return { statusCode: 200, body: 'Disconnected' };
  } catch (error) {
    console.error('Error en disconnect handler:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
};

