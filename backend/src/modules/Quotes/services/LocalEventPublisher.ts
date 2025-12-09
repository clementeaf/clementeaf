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
        case 'quote.updated': {
          const { quoteUpdatedHandler } = await import('../handlers/events/quoteUpdatedHandler');
          const mockEvent = {
            'detail-type': 'quote.updated',
            source: 'banados.quotes',
            detail: eventData
          } as unknown;
          await quoteUpdatedHandler(mockEvent as Parameters<typeof quoteUpdatedHandler>[0]);
          return true;
        }
        case 'quote.deleted': {
          const { quoteDeletedHandler } = await import('../handlers/events/quoteDeletedHandler');
          const mockEvent = {
            'detail-type': 'quote.deleted',
            source: 'banados.quotes',
            detail: eventData
          } as unknown;
          await quoteDeletedHandler(mockEvent as Parameters<typeof quoteDeletedHandler>[0]);
          return true;
        }
        case 'stock_movement.created': {
          const { stockMovementCreatedHandler } = await import('../../Products/handlers/events/stockMovementCreatedHandler');
          const mockEvent = {
            'detail-type': 'stock_movement.created',
            source: 'banados.products',
            detail: eventData
          } as unknown;
          await stockMovementCreatedHandler(mockEvent as Parameters<typeof stockMovementCreatedHandler>[0]);
          return true;
        }
        case 'client.created': {
          const { clientCreatedHandler } = await import('../../Clients/handlers/events/clientCreatedHandler');
          const mockEvent = {
            'detail-type': 'client.created',
            source: 'banados.clients',
            detail: eventData
          } as unknown;
          await clientCreatedHandler(mockEvent as Parameters<typeof clientCreatedHandler>[0]);
          return true;
        }
        case 'client.updated': {
          const { clientUpdatedHandler } = await import('../../Clients/handlers/events/clientUpdatedHandler');
          const mockEvent = {
            'detail-type': 'client.updated',
            source: 'banados.clients',
            detail: eventData
          } as unknown;
          await clientUpdatedHandler(mockEvent as Parameters<typeof clientUpdatedHandler>[0]);
          return true;
        }
        case 'client.deleted': {
          const { clientDeletedHandler } = await import('../../Clients/handlers/events/clientDeletedHandler');
          const mockEvent = {
            'detail-type': 'client.deleted',
            source: 'banados.clients',
            detail: eventData
          } as unknown;
          await clientDeletedHandler(mockEvent as Parameters<typeof clientDeletedHandler>[0]);
          return true;
        }
        case 'branch.created': {
          const { branchCreatedHandler } = await import('../../Clients/handlers/events/branchCreatedHandler');
          const mockEvent = {
            'detail-type': 'branch.created',
            source: 'banados.clients',
            detail: eventData
          } as unknown;
          await branchCreatedHandler(mockEvent as Parameters<typeof branchCreatedHandler>[0]);
          return true;
        }
        case 'branch.updated': {
          const { branchUpdatedHandler } = await import('../../Clients/handlers/events/branchUpdatedHandler');
          const mockEvent = {
            'detail-type': 'branch.updated',
            source: 'banados.clients',
            detail: eventData
          } as unknown;
          await branchUpdatedHandler(mockEvent as Parameters<typeof branchUpdatedHandler>[0]);
          return true;
        }
        case 'branch.deleted': {
          const { branchDeletedHandler } = await import('../../Clients/handlers/events/branchDeletedHandler');
          const mockEvent = {
            'detail-type': 'branch.deleted',
            source: 'banados.clients',
            detail: eventData
          } as unknown;
          await branchDeletedHandler(mockEvent as Parameters<typeof branchDeletedHandler>[0]);
          return true;
        }
        case 'ticket.created': {
          const { ticketCreatedHandler } = await import('../../Tickets/handlers/events/ticketCreatedHandler');
          const mockEvent = {
            'detail-type': 'ticket.created',
            source: 'banados.tickets',
            detail: eventData
          } as unknown;
          await ticketCreatedHandler(mockEvent as Parameters<typeof ticketCreatedHandler>[0]);
          return true;
        }
        case 'ticket.updated': {
          const { ticketUpdatedHandler } = await import('../../Tickets/handlers/events/ticketUpdatedHandler');
          const mockEvent = {
            'detail-type': 'ticket.updated',
            source: 'banados.tickets',
            detail: eventData
          } as unknown;
          await ticketUpdatedHandler(mockEvent as Parameters<typeof ticketUpdatedHandler>[0]);
          return true;
        }
        case 'ticket.status_changed': {
          const { ticketStatusChangedHandler } = await import('../../Tickets/handlers/events/ticketStatusChangedHandler');
          const mockEvent = {
            'detail-type': 'ticket.status_changed',
            source: 'banados.tickets',
            detail: eventData
          } as unknown;
          await ticketStatusChangedHandler(mockEvent as Parameters<typeof ticketStatusChangedHandler>[0]);
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

