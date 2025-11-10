import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todos los mensajes de una conversación
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de mensajes paginada
 */
const getMessagesByConversationIdHandler = async (event: APIGatewayProxyEvent) => {
  const conversationId = event.pathParameters?.conversationId;

  if (!conversationId) {
    return successResponse(400, null, 'ID de la conversación es requerido');
  }

  const conversationIdNumber = parseInt(conversationId, 10);
  if (isNaN(conversationIdNumber)) {
    return successResponse(400, null, 'ID de la conversación debe ser un número válido');
  }

  const queryParams = event.queryStringParameters || {};
  
  const page = queryParams.page ? parseInt(queryParams.page, 10) : 1;
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;

  if (isNaN(page) || page < 1) {
    return successResponse(400, null, 'El parámetro page debe ser un número mayor a 0');
  }

  if (isNaN(limit) || limit < 1) {
    return successResponse(400, null, 'El parámetro limit debe ser un número mayor a 0');
  }

  const chatService = new ChatService();
  const result = await chatService.getMessagesByConversationId(conversationIdNumber, page, limit);

  return successResponse(200, {
    data: result.data.map(message => ({
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
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages
  });
};

export const handler = handlerWrapper(getMessagesByConversationIdHandler);

