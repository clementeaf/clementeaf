import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { WebSocketService } from '../services/WebSocketService';
import { type CreateMessageDto } from '../dto/CreateMessageDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para crear un nuevo mensaje
 * @param event - Evento de API Gateway
 * @returns Respuesta con mensaje creado
 */
const createMessageHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const createMessageDto = parseBody<CreateMessageDto>(event.body!);
  if (!createMessageDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  // Validar campos requeridos
  const requiredFields = ['conversationId', 'senderId', 'content'];
  const validationError = validateRequiredFields(createMessageDto as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const chatService = new ChatService();
  const message = await chatService.createMessage(createMessageDto);

  // STREAMING: Enviar mensaje vía WebSocket a los participantes de la conversación (no bloqueante)
  // Cuando se inserta un mensaje en la base de datos, automáticamente se notifica vía WebSocket
  // No esperamos a que termine para no bloquear la respuesta HTTP
  (async () => {
    try {
      console.log(`🔄 STREAMING: Mensaje creado en BD (ID: ${message.id}), notificando vía WebSocket...`);
      
      const conversation = await chatService.getConversationById(createMessageDto.conversationId);
      
      // El endpoint de WebSocket Management API es diferente del HTTP API
      // Usamos el endpoint del WebSocket API (us3x8rdme1.execute-api.us-east-1.amazonaws.com)
      // El WebSocketService usará el fallback correcto si no se proporciona requestContext
      const webSocketService = new WebSocketService();
      
      await webSocketService.sendToConversationParticipants(
        conversation.participant1Id,
        conversation.participant2Id,
        {
          action: 'newMessage',
          message: {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            sender: {
              id: message.sender.id,
              email: message.sender.email,
              name: message.sender.name
            },
            content: message.content,
            readAt: message.readAt?.toISOString() ?? null,
            createdAt: message.createdAt.toISOString()
          }
        }
      );
      
      console.log(`✅ STREAMING: Mensaje notificado vía WebSocket a los participantes`);
    } catch (error) {
      // Si falla el envío WebSocket, no fallamos la creación del mensaje
      console.error('❌ Error enviando mensaje vía WebSocket (STREAMING):', error);
    }
  })();

  return successResponse(
    201,
    {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        name: message.sender.name
      },
      content: message.content,
      readAt: message.readAt?.toISOString() ?? null,
      createdAt: message.createdAt?.toISOString(),
      updatedAt: message.updatedAt?.toISOString()
    },
    'Mensaje creado exitosamente'
  );
};

export const handler = handlerWrapper(createMessageHandler);

