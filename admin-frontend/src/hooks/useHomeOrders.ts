import { useQuery } from '@tanstack/react-query';
import { homeOrdersService } from '../services/homeOrdersService';
import type { HomeOrder } from '../pages/Home/types';

interface UseHomeOrdersOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook para obtener órdenes de Home con paginación
 * @param options - Opciones de paginación y habilitación
 * @returns Datos de órdenes de Home y estado de la query
 */
export const useHomeOrders = (options?: UseHomeOrdersOptions) => {
  const { page = 1, limit = 50, enabled = true } = options || {};

  return useQuery<HomeOrder[], Error>({
    queryKey: ['homeOrders', page, limit],
    queryFn: async () => {
      const response = await homeOrdersService.getHomeOrders(page, limit);
      return response.data;
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 1, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
};

