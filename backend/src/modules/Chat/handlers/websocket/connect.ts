import { type APIGatewayProxyWebsocketEventV2, type APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { WebSocketService } from '../../services/WebSocketService';
import { initializeDatabase } from '../../../../config/database';

/**
 * Handler para cuando un cliente se conecta vía WebSocket
 * @param event - Evento de WebSocket connection
 * @returns Respuesta de conexión
 */
export const handler: APIGatewayProxyWebsocketHandlerV2 = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  try {
    await initializeDatabase();
    
    const connectionId = event.requestContext.connectionId;
    console.log('Connection ID:', connectionId);
    
    if (!connectionId) {
      console.error('Connection ID is missing');
      return { statusCode: 400, body: 'Connection ID is required' };
    }

    // Obtener userId de los query string parameters
    // En WebSocket v2, los query params están directamente en el evento
    const queryParams = (event as unknown as { queryStringParameters?: Record<string, string> }).queryStringParameters ?? {};
    console.log('Query parameters:', JSON.stringify(queryParams));
    
    const userIdParam = queryParams.userId;
    if (!userIdParam) {
      console.error('User ID is missing from query parameters');
      return { statusCode: 400, body: 'User ID is required' };
    }

    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      console.error('Invalid user ID:', userIdParam);
      return { statusCode: 400, body: 'Invalid user ID' };
    }

    console.log('Saving connection to DynamoDB...');
    const webSocketService = new WebSocketService();
    const saved = await webSocketService.saveConnection(connectionId, userId);
    console.log('Connection saved:', saved);

    if (!saved) {
      console.error('Failed to save connection');
      return { statusCode: 500, body: 'Failed to save connection' };
    }

    console.log('Connection successful');
    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('Error en connect handler:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return { statusCode: 500, body: 'Internal server error' };
  }
};

