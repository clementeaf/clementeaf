/**
 * Evento de dominio: Nota de venta creada
 * Este evento se dispara cuando se crea una nueva nota de venta
 */
export interface QuoteCreatedEvent {
  /**
   * Tipo de evento (usado para routing en EventBridge)
   */
  eventType: 'quote.created';

  /**
   * Versión del evento (para compatibilidad futura)
   */
  version: string;

  /**
   * Timestamp del evento
   */
  timestamp: string;

  /**
   * ID de la nota de venta creada
   */
  quoteId: number;

  /**
   * Número de cotización
   */
  numeroCotizacion: string | null;

  /**
   * Nombre del cliente
   */
  clienteNombre: string;

  /**
   * Estado de la nota de venta
   */
  estado: string;

  /**
   * ID del usuario que creó la nota de venta (si está disponible)
   */
  createdBy?: number;

  /**
   * Datos adicionales de la nota de venta
   */
  metadata?: {
    asesorAsignado?: string | null;
    terminosPago?: string | null;
    listaPrecios?: string | null;
    productos?: string | null;
  };
}

/**
 * Factory para crear eventos de nota de venta creada
 */
export class QuoteCreatedEventFactory {
  /**
   * Crea un evento de nota de venta creada
   * @param quote - Datos de la nota de venta
   * @param createdBy - ID del usuario que creó la nota (opcional)
   * @returns Evento de dominio
   */
  static create(quote: {
    id: number;
    numeroCotizacion: string | null;
    clienteNombre: string;
    estado: string;
    asesorAsignado?: string | null;
    terminosPago?: string | null;
    listaPrecios?: string | null;
    productos?: string | null;
  }, createdBy?: number): QuoteCreatedEvent {
    return {
      eventType: 'quote.created',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      quoteId: quote.id,
      numeroCotizacion: quote.numeroCotizacion,
      clienteNombre: quote.clienteNombre,
      estado: quote.estado,
      createdBy,
      metadata: {
        asesorAsignado: quote.asesorAsignado,
        terminosPago: quote.terminosPago,
        listaPrecios: quote.listaPrecios,
        productos: quote.productos
      }
    };
  }
}

