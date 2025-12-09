/**
 * Evento de dominio: Cliente eliminado
 */
export interface ClientDeletedEvent {
  eventType: 'client.deleted';
  version: string;
  timestamp: string;
  clientId: number;
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  deletedBy?: number;
}

export class ClientDeletedEventFactory {
  static create(client: { id: number; rut: string; razonSocial: string; nombreCliente: string }, deletedBy?: number): ClientDeletedEvent {
    return {
      eventType: 'client.deleted',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      clientId: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente,
      deletedBy
    };
  }
}

