import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type ProductFilters } from '../services/productService';

/**
 * Hook para obtener productos con filtros y paginación
 */
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAllProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para buscar productos por nombre o código
 */
export const useSearchProducts = (searchTerm: string, enabled: boolean = true, limit?: number) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm, limit],
    queryFn: () => productService.searchProducts(searchTerm, limit),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para sincronizar productos desde la API externa
 */
export const useSyncProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productService.syncProducts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

