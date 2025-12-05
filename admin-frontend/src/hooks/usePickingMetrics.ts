import { useQuery } from '@tanstack/react-query';
import { pickingMetricsService, type PickingMetricsResponse } from '../services/pickingMetricsService';
import { usePickingOrdersWebSocket } from './usePickingOrdersWebSocket';

interface UsePickingMetricsOptions {
  temporalidad?: 'Día' | 'Semana' | 'Mes';
  enabled?: boolean;
}

/**
 * Hook para obtener métricas de picking con actualización en tiempo real
 * @param options - Opciones de configuración
 * @returns Datos de métricas y estado de la query
 */
export const usePickingMetrics = (options?: UsePickingMetricsOptions) => {
  const { temporalidad = 'Día', enabled = true } = options || {};

  const query = useQuery<PickingMetricsResponse, Error>({
    queryKey: ['pickingMetrics', temporalidad],
    queryFn: async () => {
      return await pickingMetricsService.getPickingMetrics(temporalidad);
    },
    enabled: enabled,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refrescar cada minuto
  });

  /**
   * Escucha eventos WebSocket para refrescar métricas cuando hay cambios
   */
  usePickingOrdersWebSocket({
    onNewOrder: () => {
      // Refrescar métricas cuando llega una nueva orden
      query.refetch();
    },
    onError: (error) => {
      console.error('Error en WebSocket de métricas:', error);
    }
  });

  return query;
};

