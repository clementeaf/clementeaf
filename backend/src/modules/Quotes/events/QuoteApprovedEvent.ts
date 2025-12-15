/**
 * Evento de dominio: Nota de venta aprobada
 * Se dispara cuando una nota de venta es aprobada y debe reservar stock
 */
export interface QuoteApprovedEvent {
  eventType: 'quote.approved';
  version: string;
  timestamp: string;
  quoteId: number;
  numeroCotizacion: string | null;
  clienteNombre: string;
  productos: string | null; // JSON de productos
  approvedBy?: number;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

/**
 * Factory para crear eventos de nota de venta aprobada
 */
export class QuoteApprovedEventFactory {
  /**
   * Crea un evento de nota de venta aprobada
   */
  static create(
    quote: {
      id: number;
      numeroCotizacion: string | null;
      clienteNombre: string;
      productos: string | null;
    },
    approvedBy?: number
  ): QuoteApprovedEvent {
    return {
      eventType: 'quote.approved',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      quoteId: quote.id,
      numeroCotizacion: quote.numeroCotizacion,
      clienteNombre: quote.clienteNombre,
      productos: quote.productos,
      approvedBy,
      metadata: {}
    };
  }
}
