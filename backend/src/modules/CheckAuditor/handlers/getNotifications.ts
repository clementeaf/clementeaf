import { type APIGatewayProxyEvent } from 'aws-lambda';
import { CheckAuditorService } from '../services/CheckAuditorService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener notificaciones del SII
 * @param event - Evento de API Gateway
 * @returns Notificaciones del SII
 */
const getNotificationsHandler = async (event: APIGatewayProxyEvent) => {
  const companyId = event.queryStringParameters?.company_id;
  
  if (!companyId) {
    return errorResponse(400, 'company_id is required');
  }

  const checkAuditorService = new CheckAuditorService();
  const result = await checkAuditorService.getNotifications(companyId);

  return successResponse(200, result, 'Notifications retrieved successfully');
};

export const handler = handlerWrapper(getNotificationsHandler);

