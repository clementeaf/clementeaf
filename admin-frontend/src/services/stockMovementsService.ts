import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * Tipo de movimiento de stock
 */
export const MovementType = {
  ENTRADA: 'entrada',
  SALIDA: 'salida',
  AJUSTE: 'ajuste',
  TRANSFERENCIA: 'transferencia'
} as const;

export type MovementType = typeof MovementType[keyof typeof MovementType];

/**
 * Movimiento de stock desde la API
 */
export interface StockMovement {
  id: number;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: number;
  type: MovementType;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  stockAcumulativo: number;
  documento?: string | null;
  numeroDocumento?: string | null;
  fechaDocumento?: string | null;
  lote?: string | null;
  observaciones?: string | null;
  createdBy?: number | null;
  createdAt: string;
}

/**
 * Respuesta del historial de movimientos
 */
export interface MovementHistoryResponse {
  data: StockMovement[];
  total: number;
  currentStock: number;
}

/**
 * DTO para crear un movimiento
 */
export interface CreateMovementDto {
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: number;
  type: MovementType;
  cantidad: number;
  documento?: string;
  numeroDocumento?: string;
  fechaDocumento?: string;
  lote?: string;
  observaciones?: string;
  createdBy?: number;
}

/**
 * Opciones para obtener historial
 */
export interface GetHistoryOptions {
  productId: string;
  warehouseId?: number;
  startDate?: string;
  endDate?: string;
  movementType?: MovementType;
  limit?: number;
  offset?: number;
}

/**
 * Servicio para gestionar movimientos de stock
 */
export const stockMovementsService = {
  /**
   * Obtiene el historial de movimientos de un producto
   * @param options - Opciones de búsqueda
   * @returns Historial de movimientos
   */
  async getProductHistory(options: GetHistoryOptions): Promise<MovementHistoryResponse> {
    const { productId, warehouseId, startDate, endDate, movementType, limit = 100, offset = 0 } = options;

    const params: Record<string, string> = {};
    if (warehouseId) params.warehouseId = warehouseId.toString();
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (movementType) params.type = movementType;
    if (limit) params.limit = limit.toString();
    if (offset) params.offset = offset.toString();

    const url = endpoints.products.getHistory.replace('{productId}', productId);
    const { data } = await apiClient.get<{ data: MovementHistoryResponse }>(url, { params });
    return data.data;
  },

  /**
   * Crea un nuevo movimiento de stock
   * @param dto - Datos del movimiento
   * @returns Movimiento creado
   */
  async createMovement(dto: CreateMovementDto): Promise<StockMovement> {
    const { data } = await apiClient.post<{ data: StockMovement }>(
      endpoints.products.createMovement,
      dto
    );
    return data.data;
  }
};

