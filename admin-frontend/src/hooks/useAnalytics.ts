import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import type { QueryFilters } from '../types/analytics';

/**
 * Hook para obtener cuentas por cobrar
 */
export const useCtasPorCobrar = (filters?: QueryFilters) => {
  return useQuery({
    queryKey: ['ctas-por-cobrar', filters],
    queryFn: () => analyticsService.getCtasPorCobrar(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener deudas activas
 */
export const useDeudasActivas = (filters?: QueryFilters) => {
  return useQuery({
    queryKey: ['deudas-activas', filters],
    queryFn: () => analyticsService.getDeudasActivas(filters),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener resumen por clientes
 */
export const useResumenClientes = (limit?: number) => {
  return useQuery({
    queryKey: ['resumen-clientes', limit],
    queryFn: () => analyticsService.getResumenClientes(limit),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener resumen por vendedores
 */
export const useResumenVendedores = (limit?: number) => {
  return useQuery({
    queryKey: ['resumen-vendedores', limit],
    queryFn: () => analyticsService.getResumenVendedores(limit),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener estadísticas generales
 */
export const useEstadisticas = () => {
  return useQuery({
    queryKey: ['estadisticas'],
    queryFn: () => analyticsService.getEstadisticas(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10, // Refetch cada 10 minutos
  });
};
