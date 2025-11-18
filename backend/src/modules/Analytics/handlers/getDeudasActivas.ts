import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AnalyticsService } from '../services/AnalyticsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener deudas activas (deuda > 0)
 */
const getDeudasActivasHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const filters = {
    rut: queryParams.rut,
    codvend: queryParams.codvend ? parseInt(queryParams.codvend) : undefined,
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    limit: queryParams.limit ? parseInt(queryParams.limit) : 10,
  };

  const analyticsService = new AnalyticsService();
  const result = await analyticsService.getDeudasActivas(filters);

  return successResponse(200, result);
};

export const handler = handlerWrapper(getDeudasActivasHandler);
