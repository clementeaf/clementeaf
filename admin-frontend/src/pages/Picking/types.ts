/**
 * Estados posibles de una orden de picking
 */
export type PickingOrderStatus = 'Nota de venta emitida' | 'Picking' | 'Confirmación' | 'Despachado';

/**
 * Producto en una orden de picking
 */
export interface PickingProduct {
  id: string;
  nombre: string;
  codigo: string;
  ubicacion: string;
  stock: number;
  cantidadSolicitada: number;
}

/**
 * Orden de picking
 */
export interface PickingOrder {
  id: string;
  codigoOrden: string;
  fechaHoraOrden: string;
  vendedor: string;
  cantidadProductos: number;
  estado: PickingOrderStatus;
  productos: PickingProduct[];
}

