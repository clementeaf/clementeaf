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
    // Log inmediato para asegurar que el handler se ejecuta
    console.log('🚀 WebSocketHandlerWrapper - Handler iniciado');
    console.log('📋 WebSocketHandlerWrapper - Route:', event.requestContext.routeKey);
    console.log('📋 WebSocketHandlerWrapper - ConnectionId:', event.requestContext.connectionId);
    
    try {
      // Inicializar base de datos de forma no bloqueante para conexiones
      // Para mensajes, esperamos la inicialización
      const route = event.requestContext.routeKey;
      const isConnection = route === '$connect' || route === '$disconnect';

      console.log(`🔍 WebSocketHandlerWrapper - Route type: ${route}, isConnection: ${isConnection}`);

      if (!isConnection) {
        console.log('⏳ WebSocketHandlerWrapper - Inicializando DB (bloqueante)');
        await initializeDatabase();
        console.log('✅ WebSocketHandlerWrapper - DB inicializada');
      } else {
        // Para conexiones, inicializar en background para no bloquear
        console.log('⏳ WebSocketHandlerWrapper - Inicializando DB (no bloqueante)');
        initializeDatabase().catch((error) => {
          console.error('❌ WebSocketHandlerWrapper - Error inicializando DB:', error);
        });
      }

      console.log('▶️ WebSocketHandlerWrapper - Ejecutando handler...');
      const result = await handler(event);
      console.log('✅ WebSocketHandlerWrapper - Handler completado, statusCode:', result.statusCode);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error('❌ WebSocketHandlerWrapper - Error en handler:', errorMessage);
      console.error('❌ WebSocketHandlerWrapper - Stack:', errorStack);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errorMessage })
      };
    }
  };
};

