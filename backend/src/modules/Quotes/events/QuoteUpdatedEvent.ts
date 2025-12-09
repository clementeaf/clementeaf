/**
 * Evento de dominio: Nota de venta actualizada
 * Este evento se dispara cuando se actualiza una nota de venta (excepto cambios de estado)
 */
export interface QuoteUpdatedEvent {
  /**
   * Tipo de evento (usado para routing en EventBridge)
   */
  eventType: 'quote.updated';

  /**
   * Versión del evento (para compatibilidad futura)
   */
  version: string;

  /**
   * Timestamp del evento
   */
  timestamp: string;

  /**
   * ID de la nota de venta actualizada
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
   * Estado actual de la nota de venta
   */
  estado: string;

  /**
   * ID del usuario que actualizó la nota de venta (si está disponible)
   */
  updatedBy?: number;

  /**
   * Campos que fueron actualizados
   */
  updatedFields?: string[];
}

/**
 * Factory para crear eventos de nota de venta actualizada
 */
export class QuoteUpdatedEventFactory {
  /**
   * Crea un evento de nota de venta actualizada
   * @param quote - Datos de la nota de venta
   * @param updatedBy - ID del usuario que actualizó la nota (opcional)
   * @param updatedFields - Campos que fueron actualizados (opcional)
   * @returns Evento de dominio
   */
  static create(
    quote: {
      id: number;
      numeroCotizacion: string | null;
      clienteNombre: string;
      estado: string;
    },
    updatedBy?: number,
    updatedFields?: string[]
  ): QuoteUpdatedEvent {
    return {
      eventType: 'quote.updated',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      quoteId: quote.id,
      numeroCotizacion: quote.numeroCotizacion,
      clienteNombre: quote.clienteNombre,
      estado: quote.estado,
      updatedBy,
      updatedFields
    };
  }
}

