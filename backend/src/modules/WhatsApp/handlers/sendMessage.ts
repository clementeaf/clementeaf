import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';
import { type SendMessageDto } from '../dto/SendMessageDto';

/**
 * Handler para enviar un mensaje de WhatsApp
 * @param event - Evento de API Gateway
 * @returns Respuesta con ID del mensaje enviado
 */
const sendMessageHandler = async (event: APIGatewayProxyEvent) => {
  // TODO: Implementar validación de permisos cuando se configure NAT Gateway en VPC
  // const permissionError = await validatePermission(event, 'send:whatsapp:messages');
  // if (permissionError) return permissionError;

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const sendMessageDto = parseBody<SendMessageDto>(event.body!);
  if (!sendMessageDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  if (!sendMessageDto.to || !sendMessageDto.message) {
    return errorResponse(400, 'Los campos "to" y "message" son requeridos');
  }

  try {
    const whatsappService = new WhatsAppApiService();
    const result = await whatsappService.sendMessage(sendMessageDto.to, sendMessageDto.message);

    if (!result.success) {
      return errorResponse(500, result.error || 'Error al enviar mensaje');
    }

    return successResponse(200, { messageId: result.messageId }, 'Mensaje enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error);
    return successResponse(200, {
      success: false,
      error: 'Servicio de WhatsApp no configurado. Configure WHATSAPP_SERVICE_URL en las variables de entorno.'
    }, 'Servicio de WhatsApp no disponible');
  }
};

export const handler = handlerWrapper(sendMessageHandler);

