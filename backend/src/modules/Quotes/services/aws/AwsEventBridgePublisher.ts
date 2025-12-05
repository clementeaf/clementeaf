import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import { IEventPublisher } from '../../interfaces/IEventPublisher';

/**
 * Implementación de IEventPublisher usando AWS EventBridge
 */
export class AwsEventBridgePublisher implements IEventPublisher {
  private eventBridgeClient: EventBridgeClient;
  private eventBusName: string;
  private source: string;

  constructor(eventBusName: string = 'default', source: string = 'banados.quotes', region: string = 'us-east-1') {
    this.eventBridgeClient = new EventBridgeClient({ region });
    this.eventBusName = eventBusName;
    this.source = source;
  }

  /**
   * Publica un evento de dominio
   * @param eventType - Tipo de evento (ej: 'quote.created')
   * @param eventData - Datos del evento
   * @returns true si se publicó correctamente, false en caso contrario
   */
  async publish(eventType: string, eventData: unknown): Promise<boolean> {
    try {
      const entry: PutEventsRequestEntry = {
        Source: this.source,
        DetailType: eventType,
        Detail: JSON.stringify(eventData),
        EventBusName: this.eventBusName === 'default' ? undefined : this.eventBusName
      };

      const command = new PutEventsCommand({
        Entries: [entry]
      });

      const response = await this.eventBridgeClient.send(command);

      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        console.error('Error publicando evento:', response.Entries?.[0]?.ErrorMessage);
        return false;
      }

      console.log(`✅ Evento publicado: ${eventType} (EventId: ${response.Entries?.[0]?.EventId})`);
      return true;
    } catch (error) {
      console.error(`❌ Error publicando evento ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Publica múltiples eventos en batch
   * @param events - Array de eventos a publicar
   * @returns Número de eventos publicados exitosamente
   */
  async publishBatch(events: Array<{ eventType: string; eventData: unknown }>): Promise<number> {
    if (events.length === 0) {
      return 0;
    }

    try {
      const entries: PutEventsRequestEntry[] = events.map(event => ({
        Source: this.source,
        DetailType: event.eventType,
        Detail: JSON.stringify(event.eventData),
        EventBusName: this.eventBusName === 'default' ? undefined : this.eventBusName
      }));

      const command = new PutEventsCommand({
        Entries: entries
      });

      const response = await this.eventBridgeClient.send(command);

      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        const failedCount = response.FailedEntryCount;
        console.error(`❌ Error publicando ${failedCount} de ${events.length} eventos`);
        return events.length - failedCount;
      }

      console.log(`✅ ${events.length} eventos publicados exitosamente`);
      return events.length;
    } catch (error) {
      console.error('❌ Error publicando eventos en batch:', error);
      return 0;
    }
  }

  /**
   * Obtiene el nombre del event bus configurado
   * @returns Nombre del event bus
   */
  getEventBusName(): string {
    return this.eventBusName;
  }

  /**
   * Obtiene el source configurado
   * @returns Source de los eventos
   */
  getSource(): string {
    return this.source;
  }
}

