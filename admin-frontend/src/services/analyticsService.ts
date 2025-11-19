import { apiClient } from './api';
import type {
  CtasPorCobrar,
  EmpresaConDocumentos,
  PaginatedResponse,
  ResumenCliente,
  ResumenVendedor,
  Estadisticas,
  QueryFilters
} from '../types/analytics';

export const analyticsService = {
  /**
   * Obtiene todas las cuentas por cobrar con filtros
   */
  async getCtasPorCobrar(filters?: QueryFilters): Promise<PaginatedResponse<CtasPorCobrar>> {
    const { data } = await apiClient.get<{ data: PaginatedResponse<CtasPorCobrar> }>('/analytics/ctas-por-cobrar', {
      params: filters
    });
    return data.data;
  },

  /**
   * Obtiene deudas activas (deuda > 0) agrupadas por empresa
   */
  async getDeudasActivas(filters?: QueryFilters): Promise<PaginatedResponse<EmpresaConDocumentos>> {
    const { data } = await apiClient.get<{ data: PaginatedResponse<EmpresaConDocumentos> }>('/analytics/deudas-activas', {
      params: filters
    });
    return data.data;
  },

  /**
   * Obtiene resumen por cliente
   */
  async getResumenClientes(limit?: number): Promise<ResumenCliente[]> {
    const { data } = await apiClient.get<{ data: { clientes: ResumenCliente[] } }>('/analytics/resumen/clientes', {
      params: { limit }
    });
    return data.data.clientes;
  },

  /**
   * Obtiene resumen por vendedor
   */
  async getResumenVendedores(limit?: number): Promise<ResumenVendedor[]> {
    const { data } = await apiClient.get<{ data: { vendedores: ResumenVendedor[] } }>('/analytics/resumen/vendedores', {
      params: { limit }
    });
    return data.data.vendedores;
  },

  /**
   * Obtiene estadísticas generales
   */
  async getEstadisticas(): Promise<Estadisticas> {
    const { data } = await apiClient.get<{ data: Estadisticas }>('/analytics/estadisticas');
    return data.data;
  }
};
