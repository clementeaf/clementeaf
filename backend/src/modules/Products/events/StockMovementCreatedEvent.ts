import { MovementType } from '../entities/StockMovement.entity';

/**
 * Evento de dominio: Movimiento de stock creado
 * Este evento se dispara cuando se crea un nuevo movimiento de stock
 */
export interface StockMovementCreatedEvent {
  /**
   * Tipo de evento (usado para routing en EventBridge)
   */
  eventType: 'stock_movement.created';

  /**
   * Versión del evento (para compatibilidad futura)
   */
  version: string;

  /**
   * Timestamp del evento
   */
  timestamp: string;

  /**
   * ID del movimiento de stock creado
   */
  movementId: number;

  /**
   * ID del producto
   */
  productId: string;

  /**
   * Código del producto
   */
  productCode: string;

  /**
   * Nombre del producto
   */
  productName: string;

  /**
   * ID de la bodega
   */
  warehouseId: number;

  /**
   * Tipo de movimiento
   */
  type: MovementType;

  /**
   * Cantidad del movimiento
   */
  cantidad: number;

  /**
   * Stock anterior
   */
  stockAnterior: number;

  /**
   * Stock nuevo
   */
  stockNuevo: number;

  /**
   * ID del usuario que creó el movimiento (si está disponible)
   */
  createdBy?: number;
}

/**
 * Factory para crear eventos de movimiento de stock creado
 */
export class StockMovementCreatedEventFactory {
  /**
   * Crea un evento de movimiento de stock creado
   * @param movement - Datos del movimiento de stock
   * @param createdBy - ID del usuario que creó el movimiento (opcional)
   * @returns Evento de dominio
   */
  static create(
    movement: {
      id: number;
      productId: string;
      productCode: string;
      productName: string;
      warehouseId: number;
      type: MovementType;
      cantidad: number;
      stockAnterior: number;
      stockNuevo: number;
    },
    createdBy?: number
  ): StockMovementCreatedEvent {
    return {
      eventType: 'stock_movement.created',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      movementId: movement.id,
      productId: movement.productId,
      productCode: movement.productCode,
      productName: movement.productName,
      warehouseId: movement.warehouseId,
      type: movement.type,
      cantidad: Number(movement.cantidad),
      stockAnterior: Number(movement.stockAnterior),
      stockNuevo: Number(movement.stockNuevo),
      createdBy
    };
  }
}

