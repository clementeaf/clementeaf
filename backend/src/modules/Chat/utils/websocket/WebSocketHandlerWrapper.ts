import { type APIGatewayProxyWebsocketEventV2, type APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { initializeDatabase } from '../../../../config/database';

/**
 * Tipo para handlers de WebSocket
 */
export type WebSocketHandler = (
  event: APIGatewayProxyWebsocketEventV2
) => Promise<{ statusCode: number; body?: string }>;

/**
 * Wrapper para handlers WebSocket que maneja inicialización de DB y errores
 * @param handler - Función handler a ejecutar
 * @returns Handler envuelto con manejo de errores
 */
export const webSocketHandlerWrapper = (
  handler: WebSocketHandler
): APIGatewayProxyWebsocketHandlerV2 => {
  return async (event: APIGatewayProxyWebsocketEventV2) => {
    try {
      // Inicializar base de datos de forma no bloqueante para conexiones
      // Para mensajes, esperamos la inicialización
      const route = event.requestContext.routeKey;
      const isConnection = route === '$connect' || route === '$disconnect';

      if (!isConnection) {
        await initializeDatabase();
      } else {
        // Para conexiones, inicializar en background para no bloquear
        initializeDatabase().catch(console.error);
      }

      const result = await handler(event);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      console.error('Error en handler WebSocket:', errorMessage);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errorMessage })
      };
    }
  };
};

