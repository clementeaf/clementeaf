import { apiClient } from './api';
import { endpoints } from '../api/endpoints';
import type { PickingOrder } from '../pages/Picking/types';

export interface PaginatedPickingOrdersResponse {
  data: PickingOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar órdenes de picking
 */
export const pickingOrdersService = {
  /**
   * Obtiene todas las órdenes de picking desde las notas de venta
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @param estado - Filtro opcional por estado
   * @returns Respuesta paginada con órdenes de picking
   */
  async getPickingOrders(
    page: number = 1,
    limit: number = 50,
    estado?: string
  ): Promise<PaginatedPickingOrdersResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (estado) {
      params.append('estado', estado);
    }

    const { data } = await apiClient.get<{ data: PaginatedPickingOrdersResponse }>(
      `${endpoints.quotes.getPickingOrders}?${params.toString()}`
    );
    return data.data;
  }
};

