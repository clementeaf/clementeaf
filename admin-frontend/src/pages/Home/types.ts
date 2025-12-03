/**
 * Estados posibles de una orden en el dashboard de inicio
 */
export type HomeOrderStatus = 'Nota de Venta' | 'Picking' | 'Factura' | 'Ruta';

/**
 * Orden del dashboard de inicio
 */
export interface HomeOrder {
  id: string;
  codigoOrden: string;
  fechaHoraOrden: string;
  cliente: string;
  vendedor: string;
  monto: number;
  estado: HomeOrderStatus;
}

