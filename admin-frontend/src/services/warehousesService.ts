import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * Bodega desde la API
 */
export interface Warehouse {
  id: number;
  codigo: string;
  nombre: string;
  codigoCorto?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
}

/**
 * Respuesta de bodegas
 */
export interface WarehousesResponse {
  data: Warehouse[];
  total: number;
}

/**
 * Servicio para gestionar bodegas
 */
export const warehousesService = {
  /**
   * Obtiene todas las bodegas
   * @returns Lista de bodegas
   */
  async getAllWarehouses(): Promise<WarehousesResponse> {
    const { data } = await apiClient.get<{ data: WarehousesResponse }>(
      endpoints.products.warehouses
    );
    return data.data;
  }
};

