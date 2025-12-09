/**
 * Evento de dominio: Cliente actualizado
 */
export interface ClientUpdatedEvent {
  eventType: 'client.updated';
  version: string;
  timestamp: string;
  clientId: number;
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  updatedBy?: number;
  updatedFields?: string[];
}

export class ClientUpdatedEventFactory {
  static create(client: { id: number; rut: string; razonSocial: string; nombreCliente: string }, updatedBy?: number, updatedFields?: string[]): ClientUpdatedEvent {
    return {
      eventType: 'client.updated',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      clientId: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente,
      updatedBy,
      updatedFields
    };
  }
}

