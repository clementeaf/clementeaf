import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todas las conversaciones de un usuario
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de conversaciones
 */
const getConversationsByUserIdHandler = async (event: APIGatewayProxyEvent) => {
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return successResponse(400, null, 'ID del usuario es requerido');
  }

  const userIdNumber = parseInt(userId, 10);
  if (isNaN(userIdNumber)) {
    return successResponse(400, null, 'ID del usuario debe ser un número válido');
  }

  const chatService = new ChatService();
  const conversations = await chatService.getConversationsByUserId(userIdNumber);

  return successResponse(200, {
    data: conversations.map(conversation => ({
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
      unreadCount: conversation.unreadCount,
      lastMessage: conversation.lastMessage ? {
        id: conversation.lastMessage.id,
        content: conversation.lastMessage.content,
        senderId: conversation.lastMessage.senderId,
        sender: {
          id: conversation.lastMessage.sender.id,
          email: conversation.lastMessage.sender.email,
          name: conversation.lastMessage.sender.name
        },
        createdAt: conversation.lastMessage.createdAt.toISOString()
      } : null,
      createdAt: conversation.createdAt?.toISOString(),
      updatedAt: conversation.updatedAt?.toISOString()
    })),
    total: conversations.length
  });
};

export const handler = handlerWrapper(getConversationsByUserIdHandler);

