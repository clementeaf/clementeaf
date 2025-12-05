/**
 * Evento de cambio de estado de una Quote (Nota de Venta)
 */
export interface QuoteStatusChangedEvent {
  quoteId: number;
  numeroCotizacion: string | null;
  clienteNombre: string;
  estadoAnterior: string;
  estadoNuevo: string;
  changedBy?: number;
  changedAt: string;
}

/**
 * Factory para crear eventos de cambio de estado de Quote
 */
export class QuoteStatusChangedEventFactory {
  /**
   * Crea un evento de cambio de estado de Quote
   * @param quoteData - Datos de la Quote
   * @param estadoAnterior - Estado anterior
   * @param estadoNuevo - Estado nuevo
   * @param changedBy - ID del usuario que hizo el cambio (opcional)
   * @returns Evento de cambio de estado
   */
  static create(
    quoteData: {
      id: number;
      numeroCotizacion: string | null;
      clienteNombre: string;
    },
    estadoAnterior: string,
    estadoNuevo: string,
    changedBy?: number
  ): QuoteStatusChangedEvent {
    return {
      quoteId: quoteData.id,
      numeroCotizacion: quoteData.numeroCotizacion,
      clienteNombre: quoteData.clienteNombre,
      estadoAnterior,
      estadoNuevo,
      changedBy,
      changedAt: new Date().toISOString()
    };
  }
}

