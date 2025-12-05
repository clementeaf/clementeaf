import { type APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { WebSocketConnectionService } from '../../services/WebSocketConnectionService';
import { resolveWebSocketEndpoint } from '../../utils/websocket/WebSocketEndpointResolver';
import { AwsWebSocketClient } from '../../services/aws/AwsWebSocketClient';
import { webSocketHandlerWrapper } from '../../utils/websocket/WebSocketHandlerWrapper';

/**
 * Handler para cuando un cliente se desconecta vía WebSocket
 * @param event - Evento de WebSocket disconnection
 * @returns Respuesta de desconexión
 */
const disconnectHandler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;
  
  if (!connectionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Connection ID is required' }) };
  }

  // Inicializar servicios
  const endpoint = resolveWebSocketEndpoint(event.requestContext);
  const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
  const connectionService = new WebSocketConnectionService(webSocketClient);

  // Eliminar conexión de forma asíncrona/no bloqueante
  connectionService.deleteConnection(connectionId)
    .then(deleted => {
      if (deleted) {
        console.log(`✅ WebSocket $disconnect - Connection deleted: ${connectionId}`);
      } else {
        console.error(`❌ WebSocket $disconnect - Failed to delete connection: ${connectionId}`);
      }
    })
    .catch(error => {
      console.error(`❌ WebSocket $disconnect - Error deleting connection: ${error}`);
    });

  // Retornar inmediatamente sin esperar la eliminación de la base de datos
  return { statusCode: 200 };
};

export const handler = webSocketHandlerWrapper(disconnectHandler);
