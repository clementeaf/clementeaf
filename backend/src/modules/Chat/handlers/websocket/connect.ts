import { type APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { WebSocketConnectionService } from '../../services/WebSocketConnectionService';
import { WebSocketAuthenticator } from '../../utils/websocket/WebSocketAuthenticator';
import { resolveWebSocketEndpoint } from '../../utils/websocket/WebSocketEndpointResolver';
import { AwsWebSocketClient } from '../../services/aws/AwsWebSocketClient';
import { webSocketHandlerWrapper } from '../../utils/websocket/WebSocketHandlerWrapper';

/**
 * Handler para cuando un cliente se conecta vía WebSocket
 * @param event - Evento de WebSocket connection
 * @returns Respuesta de conexión
 */
const connectHandler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;
  
  if (!connectionId) {
    console.error('❌ Connection ID is missing');
    return { statusCode: 400, body: JSON.stringify({ error: 'Connection ID is required' }) };
  }

  // Autenticar usuario
  const authenticator = new WebSocketAuthenticator();
  const userId = await authenticator.authenticateFromToken(event);

  if (!userId) {
    console.error('❌ Authentication failed');
    return { statusCode: 401, body: JSON.stringify({ error: 'Authentication failed' }) };
  }

  console.log(`✅ WebSocket $connect - Connection accepted: connectionId=${connectionId}, userId=${userId}`);

  // Inicializar servicios
  const endpoint = resolveWebSocketEndpoint(event.requestContext);
  const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
  const connectionService = new WebSocketConnectionService(webSocketClient);

  // Guardar conexión de forma asíncrona/no bloqueante
  // NO esperamos a que termine para no bloquear la conexión WebSocket
  connectionService.saveConnection(connectionId, userId)
    .then(saved => {
      if (saved) {
        console.log(`✅ WebSocket $connect - Connection saved: ${connectionId}`);
      } else {
        console.error(`❌ WebSocket $connect - Failed to save connection: ${connectionId}`);
      }
    })
    .catch(error => {
      console.error(`❌ WebSocket $connect - Error saving connection: ${error}`);
    });

  // Retornar inmediatamente sin esperar la inicialización de la base de datos
  // Esto permite que la conexión WebSocket se establezca inmediatamente
  return { statusCode: 200 };
};

export const handler = webSocketHandlerWrapper(connectHandler);
