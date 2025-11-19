import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AnalyticsService } from '../services/AnalyticsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener deudas activas (deuda > 0)
 */
const getDeudasActivasHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  // Parsear múltiples rangos de días vencidos si están presentes
  let diasVencidosRanges: Array<{ min?: number; max?: number }> | undefined;
  if (queryParams.diasVencidosRanges) {
    try {
      diasVencidosRanges = JSON.parse(queryParams.diasVencidosRanges);
    } catch (error) {
      // Si falla el parseo, ignorar el parámetro
      diasVencidosRanges = undefined;
    }
  }
  
  const filters = {
    rut: queryParams.rut,
    razsoc: queryParams.razsoc,
    codvend: queryParams.codvend ? parseInt(queryParams.codvend) : undefined,
    diasVencidosMin: queryParams.diasVencidosMin ? parseInt(queryParams.diasVencidosMin) : undefined,
    diasVencidosMax: queryParams.diasVencidosMax ? parseInt(queryParams.diasVencidosMax) : undefined,
    diasVencidosRanges,
    deudaMin: queryParams.deudaMin ? parseFloat(queryParams.deudaMin) : undefined,
    deudaMax: queryParams.deudaMax ? parseFloat(queryParams.deudaMax) : undefined,
    fechaDesde: queryParams.fechaDesde,
    fechaHasta: queryParams.fechaHasta,
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    limit: queryParams.limit ? parseInt(queryParams.limit) : 10,
    sortBy: queryParams.sortBy as 'razsoc' | 'total_deuda' | 'vencimiento' | 'deuda' | undefined,
    sortOrder: queryParams.sortOrder as 'asc' | 'desc' | undefined,
  };

  // Debug: verificar que los parámetros se están recibiendo correctamente
  console.log('Handler - Parámetros recibidos:', {
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
    filters: filters
  });

  const analyticsService = new AnalyticsService();
  const result = await analyticsService.getDeudasActivas(filters);
  
  // Debug: verificar el orden de los datos devueltos
  if (result.data && result.data.length > 0) {
    console.log('Handler - Primeras 3 empresas devueltas:', 
      result.data.slice(0, 3).map(e => e.razsoc || e.rut)
    );
  }

  return successResponse(200, result);
};

export const handler = handlerWrapper(getDeudasActivasHandler);
