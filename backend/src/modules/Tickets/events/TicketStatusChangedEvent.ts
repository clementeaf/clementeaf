export interface TicketStatusChangedEvent {
  eventType: 'ticket.status_changed';
  version: string;
  timestamp: string;
  ticketId: number;
  title: string;
  estadoAnterior: string;
  estadoNuevo: string;
  changedBy?: number;
}

export class TicketStatusChangedEventFactory {
  static create(ticket: { id: number; title: string }, estadoAnterior: string, estadoNuevo: string, changedBy?: number): TicketStatusChangedEvent {
    return {
      eventType: 'ticket.status_changed',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ticketId: ticket.id,
      title: ticket.title,
      estadoAnterior,
      estadoNuevo,
      changedBy
    };
  }
}

