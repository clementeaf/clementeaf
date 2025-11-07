import { type APIGatewayProxyEvent } from 'aws-lambda';
import { CheckAuditorService } from '../services/CheckAuditorService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para autenticación y conexión con el SII
 * @param event - Evento de API Gateway
 * @returns Respuesta de autenticación
 */
const authenticateSessionHandler = async (event: APIGatewayProxyEvent) => {
  const companyId = event.queryStringParameters?.id;
  
  if (!companyId) {
    return errorResponse(400, 'id parameter is required');
  }

  const checkAuditorService = new CheckAuditorService();
  const result = await checkAuditorService.authenticateSession(companyId);

  return successResponse(200, result, 'Session authenticated successfully');
};

export const handler = handlerWrapper(authenticateSessionHandler);

