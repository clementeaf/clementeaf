import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para marcar un mensaje como leído
 * @param event - Evento de API Gateway
 * @returns Respuesta con mensaje actualizado
 */
const markMessageAsReadHandler = async (event: APIGatewayProxyEvent) => {
  const messageId = event.pathParameters?.messageId;

  if (!messageId) {
    return successResponse(400, null, 'ID del mensaje es requerido');
  }

  const messageIdNumber = parseInt(messageId, 10);
  if (isNaN(messageIdNumber)) {
    return successResponse(400, null, 'ID del mensaje debe ser un número válido');
  }

  const chatService = new ChatService();
  const message = await chatService.markMessageAsRead(messageIdNumber);

  return successResponse(200, {
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
  });
};

export const handler = handlerWrapper(markMessageAsReadHandler);

