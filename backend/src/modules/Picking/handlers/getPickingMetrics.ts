import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { PickingMetricsService } from '../services/PickingMetricsService';

/**
 * Handler para obtener métricas de picking
 * @param event - Evento de API Gateway
 * @returns Respuesta con métricas de picking
 */
const getPickingMetricsHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const temporalidad = (queryParams.temporalidad || 'Día') as 'Día' | 'Semana' | 'Mes';

    const metricsService = new PickingMetricsService();
    
    // Obtener métricas actuales
    const currentMetrics = await metricsService.getCurrentMetrics(temporalidad);
    
    // Obtener métricas históricas para comparación
    const historicalMetrics = await metricsService.getHistoricalMetrics(temporalidad);
    
    // Obtener datos de gráficos
    const notasVentaChartData = await metricsService.getNotasVentaChartData(temporalidad);
    const pickingChartData = await metricsService.getPickingEjecutadoChartData(temporalidad);
    const ordenesDespachadasChartData = await metricsService.getOrdenesDespachadasChartData(temporalidad);

    return successResponse(
      200,
      {
        metrics: currentMetrics,
        metricsHistory: {
          diaAnterior: temporalidad === 'Día' ? historicalMetrics : currentMetrics,
          semanaAnterior: temporalidad === 'Semana' ? historicalMetrics : currentMetrics,
          mesAnterior: temporalidad === 'Mes' ? historicalMetrics : currentMetrics
        },
        chartData: {
          notasVenta: notasVentaChartData,
          pickingEjecutado: pickingChartData,
          ordenesDespachadas: ordenesDespachadasChartData
        }
      },
      'Métricas de picking obtenidas exitosamente'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener métricas de picking';
    console.error('Error en getPickingMetrics:', errorMessage);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getPickingMetricsHandler);

