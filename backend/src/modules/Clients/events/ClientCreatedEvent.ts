/**
 * Evento de dominio: Cliente creado
 */
export interface ClientCreatedEvent {
  eventType: 'client.created';
  version: string;
  timestamp: string;
  clientId: number;
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  createdBy?: number;
}

export class ClientCreatedEventFactory {
  static create(client: { id: number; rut: string; razonSocial: string; nombreCliente: string }, createdBy?: number): ClientCreatedEvent {
    return {
      eventType: 'client.created',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      clientId: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente,
      createdBy
    };
  }
}

