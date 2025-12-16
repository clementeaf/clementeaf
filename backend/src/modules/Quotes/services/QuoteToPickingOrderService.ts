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
 * Interfaz extendida para incluir información adicional de la Quote
 */
export interface PickingOrderWithQuoteInfo extends PickingOrder {
  clienteNombre?: string;
  monto?: number;
}

/**
 * Servicio para convertir Quote a PickingOrder
 */
export class QuoteToPickingOrderService {
  /**
   * Calcula el monto total desde los productos
   * @param productosJson - JSON string de productos
   * @returns Monto total calculado
   */
  static calculateMontoTotal(productosJson: string | null): number {
    let montoTotal = 0;
    if (productosJson) {
      try {
        const productos = JSON.parse(productosJson);
        if (Array.isArray(productos)) {
          productos.forEach((prod: { precio?: number; cantidad?: number; cantidadSolicitada?: number }) => {
            const precio = prod.precio || 0;
            const cantidad = prod.cantidad || prod.cantidadSolicitada || 0;
            montoTotal += precio * cantidad;
          });
        }
      } catch (error) {
        console.error('Error calculando monto total:', error);
      }
    }
    return montoTotal;
  }

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

    // Mapear el estado de Quote al estado de PickingOrder
    const estadoMap: Record<string, PickingOrder['estado']> = {
      'borrador': 'Nota de venta emitida',
      'enviada': 'Nota de venta emitida',
      'aceptada': 'Nota de venta emitida',
      'aprobada': 'Nota de venta emitida',
      'Nota de venta emitida': 'Nota de venta emitida',
      'Picking': 'Picking',
      'Confirmación': 'Confirmación',
      'Despachado': 'Despachado',
      'rechazada': 'Nota de venta emitida',
      'cancelada': 'Nota de venta emitida'
    };

    const pickingFromEstadoPicking = (estadoPicking: string | null): PickingOrder['estado'] | null => {
      if (!estadoPicking) return null;
      switch (estadoPicking) {
        case 'iniciado':
        case 'recolectado':
          return 'Picking';
        case 'confirmado':
          return 'Confirmación';
        case 'en_ruta':
          return 'Despachado';
        default:
          return null;
      }
    };

    // Si la nota está aprobada, el Kanban debe reflejar estadoPicking (no sobrescribir "estado")
    const estadoPorPicking = quote.estado === 'aprobada' ? pickingFromEstadoPicking(quote.estadoPicking) : null;
    const pickingEstado = estadoPorPicking ?? estadoMap[quote.estado] ?? 'Nota de venta emitida';

    return {
      id: String(quote.id),
      codigoOrden: quote.numeroCotizacion || `QUOTE-${quote.id}`,
      fechaHoraOrden: quote.createdAt?.toISOString() || new Date().toISOString(),
      vendedor: quote.asesorAsignado || 'Sin asignar',
      cantidadProductos: productos.length,
      estado: pickingEstado,
      productos
    };
  }

  /**
   * Convierte una Quote a PickingOrder con información adicional
   * @param quote - Nota de venta a convertir
   * @returns Orden de picking con información adicional
   */
  static convertWithQuoteInfo(quote: Quote): PickingOrderWithQuoteInfo {
    const pickingOrder = this.convert(quote);
    const montoTotal = this.calculateMontoTotal(quote.productos);
    
    return {
      ...pickingOrder,
      clienteNombre: quote.clienteNombre,
      monto: montoTotal
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

  /**
   * Convierte múltiples Quotes a PickingOrders con información adicional
   * @param quotes - Array de notas de venta
   * @returns Array de órdenes de picking con información adicional
   */
  static convertManyWithQuoteInfo(quotes: Quote[]): PickingOrderWithQuoteInfo[] {
    return quotes.map(quote => this.convertWithQuoteInfo(quote));
  }
}

