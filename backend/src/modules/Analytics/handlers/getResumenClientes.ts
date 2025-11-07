import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AnalyticsService } from '../services/AnalyticsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener resumen por cliente
 */
const getResumenClientesHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;

  const analyticsService = new AnalyticsService();
  const result = await analyticsService.getResumenPorCliente(limit);

  return successResponse(200, { clientes: result });
};

export const handler = handlerWrapper(getResumenClientesHandler);
