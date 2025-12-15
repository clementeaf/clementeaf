import { MovementType } from '../entities/StockMovement.entity';

/**
 * DTO para crear un movimiento de stock
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
  quoteId?: number;
}

