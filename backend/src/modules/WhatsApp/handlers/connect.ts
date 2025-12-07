import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';
import { validatePermission } from '../../Users/utils/permissions';

/**
 * Handler para conectar con WhatsApp
 * @param event - Evento de API Gateway
 * @returns Respuesta de conexión
 */
const connectHandler = async (event: APIGatewayProxyEvent) => {
  await validatePermission(event, 'manage:whatsapp:connection');

  const whatsappService = new WhatsAppApiService();
  const result = await whatsappService.connect();

  return successResponse(200, result, result.message);
};

export const handler = handlerWrapper(connectHandler);

