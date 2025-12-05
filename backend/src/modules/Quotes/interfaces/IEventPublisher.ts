/**
 * Interfaz para publicar eventos de dominio
 * Permite abstraer la implementación específica (AWS EventBridge, SNS, etc.)
 */
export interface IEventPublisher {
  /**
   * Publica un evento de dominio
   * @param eventType - Tipo de evento (ej: 'quote.created')
   * @param eventData - Datos del evento
   * @returns true si se publicó correctamente, false en caso contrario
   */
  publish(eventType: string, eventData: unknown): Promise<boolean>;

  /**
   * Publica múltiples eventos en batch
   * @param events - Array de eventos a publicar
   * @returns Número de eventos publicados exitosamente
   */
  publishBatch(events: Array<{ eventType: string; eventData: unknown }>): Promise<number>;
}

