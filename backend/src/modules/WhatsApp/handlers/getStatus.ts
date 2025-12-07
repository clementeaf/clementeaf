import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';
import { validatePermission } from '../../Users/utils/permissions';

/**
 * Handler para obtener el estado de la conexión de WhatsApp
 * @param event - Evento de API Gateway
 * @returns Estado de la conexión
 */
const getStatusHandler = async (event: APIGatewayProxyEvent) => {
  await validatePermission(event, 'view:whatsapp:status');

  const whatsappService = new WhatsAppApiService();
  const status = await whatsappService.getStatus();

  return successResponse(200, status.data, 'Estado de WhatsApp obtenido');
};

export const handler = handlerWrapper(getStatusHandler);

