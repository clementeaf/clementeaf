import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para marcar todos los mensajes de una conversación como leídos
 * @param event - Evento de API Gateway
 * @returns Respuesta con número de mensajes marcados como leídos
 */
const markConversationMessagesAsReadHandler = async (event: APIGatewayProxyEvent) => {
  const conversationId = event.pathParameters?.conversationId;

  if (!conversationId) {
    return successResponse(400, null, 'ID de la conversación es requerido');
  }

  const conversationIdNumber = parseInt(conversationId, 10);
  if (isNaN(conversationIdNumber)) {
    return successResponse(400, null, 'ID de la conversación debe ser un número válido');
  }

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const body = parseBody<{ userId: number }>(event.body!);
  if (!body) {
    return errorResponse(400, 'Invalid JSON format');
  }

  // Validar campos requeridos
  const requiredFields = ['userId'];
  const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const chatService = new ChatService();
  const count = await chatService.markConversationMessagesAsRead(conversationIdNumber, body.userId);

  return successResponse(
    200,
    {
      conversationId: conversationIdNumber,
      messagesMarkedAsRead: count
    },
    `${count} mensaje(s) marcado(s) como leído(s)`
  );
};

export const handler = handlerWrapper(markConversationMessagesAsReadHandler);

