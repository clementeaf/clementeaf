import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

export interface PickingMetrics {
  totalOrdenes: number;
  ordenesNotaVentaEmitida: number;
  ordenesPicking: number;
  ordenesConfirmacion: number;
  ordenesDespachadas: number;
  tiempoPromedioPicking: number;
  eficiencia: number;
  ordenesHoy: number;
}

export interface ChartDataPoint {
  periodo: string;
  cantidad: number;
  vendedor?: string;
  horaEmision?: string;
}

export interface PickingMetricsResponse {
  metrics: PickingMetrics;
  metricsHistory: {
    diaAnterior: PickingMetrics;
    semanaAnterior: PickingMetrics;
    mesAnterior: PickingMetrics;
  };
  chartData: {
    notasVenta: ChartDataPoint[];
    pickingEjecutado: ChartDataPoint[];
    ordenesDespachadas: ChartDataPoint[];
  };
}

/**
 * Servicio para obtener métricas de picking
 */
export const pickingMetricsService = {
  /**
   * Obtiene métricas de picking
   * @param temporalidad - Temporalidad para las métricas ('Día', 'Semana', 'Mes')
   * @returns Métricas de picking
   */
  async getPickingMetrics(temporalidad: 'Día' | 'Semana' | 'Mes' = 'Día'): Promise<PickingMetricsResponse> {
    const { data } = await apiClient.get<{ data: PickingMetricsResponse }>(endpoints.picking.getMetrics, {
      params: { temporalidad }
    });
    return data.data;
  }
};

