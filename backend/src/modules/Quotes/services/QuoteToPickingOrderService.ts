import { Quote } from '../entities/Quote.entity';

/**
 * Interfaz para producto de picking (compatible con frontend)
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
 * Interfaz para orden de picking (compatible con frontend)
 */
export interface PickingOrder {
  id: string;
  codigoOrden: string;
  fechaHoraOrden: string;
  vendedor: string;
  cantidadProductos: number;
  estado: 'Nota de venta emitida' | 'Picking' | 'Confirmación' | 'Despachado';
  productos: PickingProduct[];
}

/**
 * Servicio para convertir Quote a PickingOrder
 */
export class QuoteToPickingOrderService {
  /**
   * Convierte una Quote a PickingOrder
   * @param quote - Nota de venta a convertir
   * @returns Orden de picking
   */
  static convert(quote: Quote): PickingOrder {
    // Parsear productos desde JSON string
    let productos: PickingProduct[] = [];
    if (quote.productos) {
      try {
        const productosJson = JSON.parse(quote.productos);
        if (Array.isArray(productosJson)) {
          productos = productosJson.map((prod: unknown, index: number) => ({
            id: String((prod as { id?: string | number })?.id || index + 1),
            nombre: (prod as { nombre?: string })?.nombre || 'Producto sin nombre',
            codigo: (prod as { codigo?: string })?.codigo || `PROD-${index + 1}`,
            ubicacion: (prod as { ubicacion?: string })?.ubicacion || 'Sin ubicación',
            stock: (prod as { stock?: number })?.stock || 0,
            cantidadSolicitada: (prod as { cantidadSolicitada?: number })?.cantidadSolicitada || 0
          }));
        }
      } catch (error) {
        console.error('Error parseando productos de quote:', error);
        productos = [];
      }
    }

    return {
      id: String(quote.id),
      codigoOrden: quote.numeroCotizacion || `QUOTE-${quote.id}`,
      fechaHoraOrden: quote.createdAt?.toISOString() || new Date().toISOString(),
      vendedor: quote.asesorAsignado || 'Sin asignar',
      cantidadProductos: productos.length,
      estado: 'Nota de venta emitida',
      productos
    };
  }

  /**
   * Convierte múltiples Quotes a PickingOrders
   * @param quotes - Array de notas de venta
   * @returns Array de órdenes de picking
   */
  static convertMany(quotes: Quote[]): PickingOrder[] {
    return quotes.map(quote => this.convert(quote));
  }
}

