/**
 * Evento de dominio: Nota de venta eliminada
 * Este evento se dispara cuando se elimina una nota de venta
 */
export interface QuoteDeletedEvent {
  /**
   * Tipo de evento (usado para routing en EventBridge)
   */
  eventType: 'quote.deleted';

  /**
   * Versión del evento (para compatibilidad futura)
   */
  version: string;

  /**
   * Timestamp del evento
   */
  timestamp: string;

  /**
   * ID de la nota de venta eliminada
   */
  quoteId: number;

  /**
   * Número de cotización (para referencia)
   */
  numeroCotizacion: string | null;

  /**
   * Nombre del cliente (para referencia)
   */
  clienteNombre: string;

  /**
   * Estado de la nota de venta antes de ser eliminada
   */
  estado: string;

  /**
   * ID del usuario que eliminó la nota de venta (si está disponible)
   */
  deletedBy?: number;
}

/**
 * Factory para crear eventos de nota de venta eliminada
 */
export class QuoteDeletedEventFactory {
  /**
   * Crea un evento de nota de venta eliminada
   * @param quote - Datos de la nota de venta antes de ser eliminada
   * @param deletedBy - ID del usuario que eliminó la nota (opcional)
   * @returns Evento de dominio
   */
  static create(
    quote: {
      id: number;
      numeroCotizacion: string | null;
      clienteNombre: string;
      estado: string;
    },
    deletedBy?: number
  ): QuoteDeletedEvent {
    return {
      eventType: 'quote.deleted',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      quoteId: quote.id,
      numeroCotizacion: quote.numeroCotizacion,
      clienteNombre: quote.clienteNombre,
      estado: quote.estado,
      deletedBy
    };
  }
}

