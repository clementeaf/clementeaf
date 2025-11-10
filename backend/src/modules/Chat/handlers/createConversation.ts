import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ChatService } from '../services/ChatService';
import { type CreateConversationDto } from '../dto/CreateConversationDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para crear una nueva conversación
 * @param event - Evento de API Gateway
 * @returns Respuesta con conversación creada
 */
const createConversationHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const createConversationDto = parseBody<CreateConversationDto>(event.body!);
  if (!createConversationDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  // Validar campos requeridos
  const requiredFields = ['participant1Id', 'participant2Id'];
  const validationError = validateRequiredFields(createConversationDto as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const chatService = new ChatService();
  const conversation = await chatService.createConversation(createConversationDto);

  return successResponse(
    201,
    {
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
    },
    'Conversación creada exitosamente'
  );
};

export const handler = handlerWrapper(createConversationHandler);

