import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener una conversación por su ID
 * @param event - Evento de API Gateway
 * @returns Respuesta con conversación encontrada
 */
const getConversationByIdHandler = async (event: APIGatewayProxyEvent) => {
  const conversationIdParam = event.pathParameters?.conversationId;

  if (!conversationIdParam) {
    return successResponse(400, null, 'ID de la conversación es requerido');
  }

  const conversationId = parseInt(conversationIdParam, 10);
  if (isNaN(conversationId)) {
    return successResponse(400, null, 'ID de la conversación debe ser un número válido');
  }

  const chatService = new ChatService();
  const conversation = await chatService.getConversationById(conversationId);

  return successResponse(200, {
    id: conversation.id,
    participant1Id: conversation.participant1Id,
    participant2Id: conversation.participant2Id,
    participant1: {
      id: conversation.participant1.id,
      email: conversation.participant1.email,
      name: conversation.participant1.name
    },
    participant2: {
      id: conversation.participant2.id,
      email: conversation.participant2.email,
      name: conversation.participant2.name
    },
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    createdAt: conversation.createdAt?.toISOString(),
    updatedAt: conversation.updatedAt?.toISOString()
  });
};

export const handler = handlerWrapper(getConversationByIdHandler);

