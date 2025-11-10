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

  // Enviar mensaje vía WebSocket a los participantes de la conversación (no bloqueante)
  // No esperamos a que termine para no bloquear la respuesta
  (async () => {
    try {
      const conversation = await chatService.getConversationById(createMessageDto.conversationId);
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
    } catch (error) {
      // Si falla el envío WebSocket, no fallamos la creación del mensaje
      console.error('Error enviando mensaje vía WebSocket:', error);
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

