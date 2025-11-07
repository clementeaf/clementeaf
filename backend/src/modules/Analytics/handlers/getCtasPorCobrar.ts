import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AnalyticsService } from '../services/AnalyticsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todas las cuentas por cobrar con filtros y paginación
 */
const getCtasPorCobrarHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const filters = {
    rut: queryParams.rut,
    codvend: queryParams.codvend ? parseInt(queryParams.codvend) : undefined,
    team: queryParams.team,
    diasVencidosMin: queryParams.diasVencidosMin ? parseInt(queryParams.diasVencidosMin) : undefined,
    diasVencidosMax: queryParams.diasVencidosMax ? parseInt(queryParams.diasVencidosMax) : undefined,
    deudaMin: queryParams.deudaMin ? parseFloat(queryParams.deudaMin) : undefined,
    deudaMax: queryParams.deudaMax ? parseFloat(queryParams.deudaMax) : undefined,
    fechaDesde: queryParams.fechaDesde,
    fechaHasta: queryParams.fechaHasta,
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
  };

  const analyticsService = new AnalyticsService();
  const result = await analyticsService.getCtasPorCobrar(filters);

  return successResponse(200, result);
};

export const handler = handlerWrapper(getCtasPorCobrarHandler);
