import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AnalyticsService } from '../services/AnalyticsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener estadísticas generales
 */
const getEstadisticasHandler = async (_event: APIGatewayProxyEvent) => {
  const analyticsService = new AnalyticsService();
  const result = await analyticsService.getEstadisticasGenerales();

  return successResponse(200, result);
};

export const handler = handlerWrapper(getEstadisticasHandler);
