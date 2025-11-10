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
    const connectionId = event.requestContext.connectionId;
    console.log('🔌 WebSocket $connect - Connection ID:', connectionId);
    
    if (!connectionId) {
      console.error('❌ Connection ID is missing');
      return { statusCode: 400, body: JSON.stringify({ error: 'Connection ID is required' }) };
    }

    // Obtener userId de los query string parameters
    // En WebSocket v2, los query params están directamente en el evento
    const queryParams = (event as unknown as { queryStringParameters?: Record<string, string> }).queryStringParameters ?? {};
    console.log('🔍 WebSocket $connect - Query parameters:', JSON.stringify(queryParams));
    
    const userIdParam = queryParams.userId;
    if (!userIdParam) {
      console.error('❌ User ID is missing from query parameters');
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID is required' }) };
    }

    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      console.error('❌ Invalid user ID:', userIdParam);
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid user ID' }) };
    }

    console.log(`✅ WebSocket $connect - Connection accepted: connectionId=${connectionId}, userId=${userId}`);

    // Inicializar base de datos y guardar conexión de forma asíncrona/no bloqueante
    // NO esperamos a que termine para no bloquear la conexión WebSocket
    (async () => {
      try {
        console.log('🔄 WebSocket $connect - Initializing database (non-blocking)...');
        await initializeDatabase();
        console.log('💾 WebSocket $connect - Saving connection to PostgreSQL...');
        const webSocketService = new WebSocketService();
        const saved = await webSocketService.saveConnection(connectionId, userId);
        console.log(`✅ WebSocket $connect - Connection saved to PostgreSQL: ${saved}`);
      } catch (error) {
        console.error('❌ WebSocket $connect - Error saving connection (non-blocking):', error);
      }
    })();

    // Retornar inmediatamente sin esperar la inicialización de la base de datos
    // Esto permite que la conexión WebSocket se establezca inmediatamente
    return { statusCode: 200 };
  } catch (error) {
    console.error('❌ WebSocket $connect - Unexpected error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

