import { IEventPublisher } from '../interfaces/IEventPublisher';

/**
 * Implementación de IEventPublisher para desarrollo local
 * Ejecuta los handlers directamente sin EventBridge
 */
export class LocalEventPublisher implements IEventPublisher {
  /**
   * Publica un evento de dominio (en local, ejecuta el handler directamente)
   * @param eventType - Tipo de evento (ej: 'quote.created')
   * @param eventData - Datos del evento
   * @returns true si se procesó correctamente
   */
  async publish(eventType: string, eventData: unknown): Promise<boolean> {
    try {
      console.log(`🔧 [LOCAL] Ejecutando handler directamente para evento: ${eventType}`);
      
      // Importar y ejecutar el handler correspondiente
      switch (eventType) {
        case 'quote.created': {
          const { quoteCreatedHandler } = await import('../handlers/events/quoteCreatedHandler');
          const mockEvent = {
            'detail-type': 'quote.created',
            source: 'banados.quotes',
            detail: eventData
          } as unknown;
          await quoteCreatedHandler(mockEvent as Parameters<typeof quoteCreatedHandler>[0]);
          return true;
        }
        case 'quote.status_changed': {
          const { quoteStatusChangedHandler } = await import('../handlers/events/quoteStatusChangedHandler');
          const mockEvent = {
            'detail-type': 'quote.status_changed',
            source: 'banados.quotes',
            detail: eventData
          } as unknown;
          await quoteStatusChangedHandler(mockEvent as Parameters<typeof quoteStatusChangedHandler>[0]);
          return true;
        }
        default:
          console.warn(`⚠️ [LOCAL] Handler no encontrado para evento: ${eventType}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ [LOCAL] Error ejecutando handler para ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Publica múltiples eventos en batch
   * @param events - Array de eventos a publicar
   * @returns Número de eventos procesados exitosamente
   */
  async publishBatch(events: Array<{ eventType: string; eventData: unknown }>): Promise<number> {
    if (events.length === 0) {
      return 0;
    }

    let successCount = 0;
    for (const event of events) {
      const success = await this.publish(event.eventType, event.eventData);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  }
}

