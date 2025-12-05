import { apiClient } from './api';
import { endpoints } from '../api/endpoints';
import type { HomeOrder } from '../pages/Home/types';
import type { PickingOrder } from '../pages/Picking/types';
import type { PaginatedPickingOrdersResponse } from './pickingOrdersService';

export interface PaginatedHomeOrdersResponse {
  data: HomeOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Convierte una PickingOrder a HomeOrder
 * @param pickingOrder - Orden de picking
 * @param quoteInfo - Información adicional de la quote (cliente, monto)
 * @returns Orden de Home
 */
export const convertPickingOrderToHomeOrder = (
  pickingOrder: PickingOrder,
  quoteInfo?: { clienteNombre?: string; monto?: number }
): HomeOrder => {
  // Calcular monto desde productos si no viene en quoteInfo
  let monto = quoteInfo?.monto || 0;
  if (monto === 0 && pickingOrder.productos) {
    pickingOrder.productos.forEach(prod => {
      // Si los productos tienen precio, calcularlo
      // Por ahora, usar cantidadProductos como aproximación
      monto += pickingOrder.cantidadProductos * 1000; // Valor por defecto
    });
  }

  // Mapear estado de Picking a Home
  const estadoMap: Record<string, HomeOrder['estado']> = {
    'Nota de venta emitida': 'Nota de Venta',
    'Picking': 'Picking',
    'Confirmación': 'Factura',
    'Despachado': 'Ruta'
  };

  return {
    id: pickingOrder.id,
    codigoOrden: pickingOrder.codigoOrden,
    fechaHoraOrden: pickingOrder.fechaHoraOrden,
    cliente: quoteInfo?.clienteNombre || 'Sin cliente',
    vendedor: pickingOrder.vendedor,
    monto: monto,
    estado: estadoMap[pickingOrder.estado] || 'Nota de Venta'
  };
};

/**
 * Servicio para gestionar órdenes de Home
 */
export const homeOrdersService = {
  /**
   * Obtiene todas las órdenes de Home desde las notas de venta
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Respuesta paginada con órdenes de Home
   */
  async getHomeOrders(
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedHomeOrdersResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const { data } = await apiClient.get<{ data: PaginatedPickingOrdersResponse }>(
      `${endpoints.quotes.getPickingOrders}?${params.toString()}`
    );

    // Convertir PickingOrders a HomeOrders
    // El backend ahora incluye clienteNombre y monto en PickingOrder
    const homeOrders: HomeOrder[] = data.data.data.map((pickingOrder: PickingOrder & { clienteNombre?: string; monto?: number }) => {
      return convertPickingOrderToHomeOrder(pickingOrder, {
        clienteNombre: pickingOrder.clienteNombre,
        monto: pickingOrder.monto
      });
    });

    return {
      data: homeOrders,
      total: data.data.total,
      page: data.data.page,
      limit: data.data.limit,
      totalPages: data.data.totalPages
    };
  }
};

