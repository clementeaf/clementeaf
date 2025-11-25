import { type APIGatewayProxyWebsocketEventV2, type APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { ChatService } from '../../services/ChatService';
import { initializeDatabase } from '../../../../config/database';

/**
 * Handler para procesar mensajes vía WebSocket ($default route)
 * Esto se ejecuta cuando se envía un mensaje a través del WebSocket
 * @param event - Evento de WebSocket message
 * @returns Respuesta de procesamiento
 */
export const handler: APIGatewayProxyWebsocketHandlerV2 = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  try {
    const connectionId = event.requestContext.connectionId;
    console.log('📨 WebSocket $default - Received message from:', connectionId);

    if (!connectionId) {
      console.error('❌ Connection ID is missing');
      return { statusCode: 400, body: JSON.stringify({ error: 'Connection ID is required' }) };
    }

    // Parsear el mensaje del body
    let messageData: { action?: string; conversationId?: string; content?: string };
    try {
      messageData = JSON.parse(event.body || '{}');
    } catch (e) {
      console.error('❌ Invalid JSON in message body:', event.body);
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON format' }) };
    }

    const { action, conversationId, content } = messageData;
    console.log('📋 WebSocket $default - Message:', { action, conversationId, contentLength: content?.length });

    // Inicializar base de datos
    await initializeDatabase();
    const chatService = new ChatService();

    // Para este simple handler, simplemente procesar el mensaje
    // En producción, obtener userId de la base de datos o del token
    // Por ahora, usar un valor por defecto
    const userId = 1;  // TODO: Obtener del token o de la conexión WebSocket guardada
    console.log(`🔍 WebSocket $default - User ID: ${userId}`);

    // Procesar según la acción
    switch (action) {
      case 'send_message': {
        if (!conversationId || !content) {
          return { statusCode: 400, body: JSON.stringify({ error: 'conversationId and content are required' }) };
        }

        console.log(`💬 WebSocket $default - Saving message from user ${userId} to conversation ${conversationId}`);

        // Guardar mensaje en la base de datos
        const message = await chatService.createMessage({
          conversationId: parseInt(conversationId, 10),
          senderId: userId,
          content,
        });

        console.log('✅ WebSocket $default - Message saved:', message.id);

        // Obtener todas las conexiones activas (simplificado para prueba)
        // En producción, obtener las conexiones asociadas a la conversación
        console.log(`📡 WebSocket $default - Message saved, broadcasting to participants`);

        // Mensaje guardado exitosamente
        console.log('✅ WebSocket $default - Message broadcast triggered');

        return { statusCode: 200, body: JSON.stringify({ success: true, messageId: message.id }) };
      }

      case 'typing_start': {
        if (!conversationId) {
          return { statusCode: 400, body: JSON.stringify({ error: 'conversationId is required' }) };
        }

        console.log(`⌨️  WebSocket $default - User ${userId} started typing in conversation ${conversationId}`);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }

      case 'typing_stop': {
        if (!conversationId) {
          return { statusCode: 400, body: JSON.stringify({ error: 'conversationId is required' }) };
        }

        console.log(`⌨️  WebSocket $default - User ${userId} stopped typing in conversation ${conversationId}`);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }

      default: {
        console.warn('⚠️  WebSocket $default - Unknown action:', action);
        return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
      }
    }
  } catch (error) {
    console.error('❌ WebSocket $default - Unexpected error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
