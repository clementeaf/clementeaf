import { useQuery } from '@tanstack/react-query';
import { pickingOrdersService } from '../services/pickingOrdersService';

/**
 * Hook para obtener órdenes de picking
 * @param page - Número de página
 * @param limit - Límite de resultados por página
 * @param estado - Filtro opcional por estado
 * @returns Query con órdenes de picking
 */
export const usePickingOrders = (page: number = 1, limit: number = 50, estado?: string) => {
  return useQuery({
    queryKey: ['pickingOrders', page, limit, estado],
    queryFn: () => pickingOrdersService.getPickingOrders(page, limit, estado),
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: false
  });
};

