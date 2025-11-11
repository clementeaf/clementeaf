import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { WebSocketService } from '../services/WebSocketService';
import { StartTypingDto } from '../dto/StartTypingDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para iniciar typing indicator
 * @param event - Evento de API Gateway
 * @returns Respuesta HTTP
 */
const startTypingHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const body = parseBody<StartTypingDto>(event.body!);
  if (!body) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const requiredFields = ['conversationId', 'userId'];
  const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const chatService = new ChatService();

  // Iniciar typing indicator
  await chatService.startTyping(body.conversationId, body.userId);

  // Obtener la conversación para notificar al otro participante
  const conversation = await chatService.getConversationById(body.conversationId);
  const otherParticipantId = conversation.participant1Id === body.userId 
    ? conversation.participant2Id 
    : conversation.participant1Id;

  // STREAMING: Notificar vía WebSocket al otro participante (no bloqueante)
  (async () => {
    try {
      const webSocketService = new WebSocketService();
      const connections = await webSocketService.getUserConnections(otherParticipantId);

      await Promise.allSettled(
        connections.map(connectionId =>
          webSocketService.sendToConnection(connectionId, {
            action: 'typing',
            conversationId: body.conversationId,
            userId: body.userId,
            isTyping: true
          })
        )
      );
    } catch (error) {
      console.error('❌ Error enviando typing indicator vía WebSocket:', error);
    }
  })();

  return successResponse(200, { message: 'Typing indicator iniciado' });
};

export const handler = handlerWrapper(startTypingHandler);

