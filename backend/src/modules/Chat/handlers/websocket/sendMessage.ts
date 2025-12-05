import { type APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { WebSocketMessageService } from '../../services/WebSocketMessageService';
import { WebSocketConnectionService } from '../../services/WebSocketConnectionService';
import { WebSocketMessageParser } from '../../utils/websocket/WebSocketMessageParser';
import { WebSocketAuthenticator } from '../../utils/websocket/WebSocketAuthenticator';
import { resolveWebSocketEndpoint } from '../../utils/websocket/WebSocketEndpointResolver';
import { AwsWebSocketClient } from '../../services/aws/AwsWebSocketClient';
import { webSocketHandlerWrapper } from '../../utils/websocket/WebSocketHandlerWrapper';

/**
 * Handler para procesar mensajes vía WebSocket ($default route)
 * @param event - Evento de WebSocket message
 * @returns Respuesta de procesamiento
 */
const sendMessageHandler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;
  
  if (!connectionId) {
    console.error('❌ Connection ID is missing');
    return { statusCode: 400, body: JSON.stringify({ error: 'Connection ID is required' }) };
  }

  // Parsear mensaje
  const parser = new WebSocketMessageParser();
  const message = parser.parseMessage(event);

  if (!message) {
    console.error('❌ Invalid message format');
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid message format' }) };
  }

  // Validar mensaje
  if (!parser.validateMessage(message)) {
    console.error('❌ Invalid message: missing required fields');
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid message: missing required fields' }) };
  }

  // Autenticar usuario desde la conexión
  const authenticator = new WebSocketAuthenticator();
  const userId = await authenticator.getUserIdFromConnection(connectionId);

  if (!userId) {
    console.error('❌ User not found for connection');
    return { statusCode: 401, body: JSON.stringify({ error: 'User not found for connection' }) };
  }

  // Inicializar servicios
  const endpoint = resolveWebSocketEndpoint(event.requestContext);
  const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
  const connectionService = new WebSocketConnectionService(webSocketClient);
  const messageService = new WebSocketMessageService(connectionService);

  // Procesar mensaje
  const response = await messageService.processMessage(message, userId);

  if (!response.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: response.error || 'Failed to process message' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response)
  };
};

export const handler = webSocketHandlerWrapper(sendMessageHandler);
