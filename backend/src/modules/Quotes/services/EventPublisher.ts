import { IEventPublisher } from '../interfaces/IEventPublisher';
import { AwsEventBridgePublisher } from './aws/AwsEventBridgePublisher';
import { LocalEventPublisher } from './LocalEventPublisher';

/**
 * Servicio para publicar eventos de dominio
 * Abstrae la implementación específica del publicador
 */
export class EventPublisher {
  private publisher: IEventPublisher;

  constructor(publisher?: IEventPublisher) {
    // Si no se proporciona un publicador, detectar el entorno
    if (publisher) {
      this.publisher = publisher;
    } else {
      // En desarrollo local, usar LocalEventPublisher
      // En AWS, usar AwsEventBridgePublisher
      const isLocal = process.env.IS_OFFLINE === 'true' || process.env.NODE_ENV === 'development' || !process.env.AWS_LAMBDA_FUNCTION_NAME;
      
      if (isLocal) {
        console.log('🔧 [EventPublisher] Usando LocalEventPublisher para desarrollo local');
        this.publisher = new LocalEventPublisher();
      } else {
        const eventBusName = process.env.EVENT_BRIDGE_BUS_NAME || 'default';
        const source = process.env.EVENT_BRIDGE_SOURCE || 'banados.quotes';
        const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
        
        this.publisher = new AwsEventBridgePublisher(eventBusName, source, region);
      }
    }
  }

  /**
   * Publica un evento de dominio
   * @param eventType - Tipo de evento (ej: 'quote.created')
   * @param eventData - Datos del evento
   * @returns true si se publicó correctamente, false en caso contrario
   */
  async publish(eventType: string, eventData: unknown): Promise<boolean> {
    return await this.publisher.publish(eventType, eventData);
  }

  /**
   * Publica múltiples eventos en batch
   * @param events - Array de eventos a publicar
   * @returns Número de eventos publicados exitosamente
   */
  async publishBatch(events: Array<{ eventType: string; eventData: unknown }>): Promise<number> {
    return await this.publisher.publishBatch(events);
  }
}

