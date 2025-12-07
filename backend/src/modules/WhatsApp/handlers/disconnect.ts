import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';
import { validatePermission } from '../../Users/utils/permissions';

/**
 * Handler para desconectar WhatsApp
 * @param event - Evento de API Gateway
 * @returns Respuesta de desconexión
 */
const disconnectHandler = async (event: APIGatewayProxyEvent) => {
  await validatePermission(event, 'manage:whatsapp:connection');

  const whatsappService = new WhatsAppApiService();
  const result = await whatsappService.disconnect();

  return successResponse(200, result, result.message);
};

export const handler = handlerWrapper(disconnectHandler);

