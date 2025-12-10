import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';
import { validatePermission } from '../../Users/utils/permissions';
import { type SendImageDto } from '../dto/SendImageDto';

/**
 * Handler para enviar una imagen por WhatsApp
 * @param event - Evento de API Gateway
 * @returns Respuesta con ID del mensaje enviado
 */
const sendImageHandler = async (event: APIGatewayProxyEvent) => {
  const permissionError = await validatePermission(event, 'send:whatsapp:messages');
  if (permissionError) return permissionError;

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const sendImageDto = parseBody<SendImageDto>(event.body!);
  if (!sendImageDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  if (!sendImageDto.to || !sendImageDto.imageUrl) {
    return errorResponse(400, 'Los campos "to" e "imageUrl" son requeridos');
  }

  try {
    const whatsappService = new WhatsAppApiService();
    const result = await whatsappService.sendImage(
      sendImageDto.to,
      sendImageDto.imageUrl,
      sendImageDto.caption
    );

    if (!result.success) {
      return errorResponse(500, result.error || 'Error al enviar imagen');
    }

    return successResponse(200, { messageId: result.messageId }, 'Imagen enviada exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al enviar imagen de WhatsApp:', errorMessage);
    return errorResponse(503, 'Servicio de WhatsApp no disponible. Verifica que el servicio esté desplegado y configurado correctamente.');
  }
};

export const handler = handlerWrapper(sendImageHandler);

