export interface TicketUpdatedEvent {
  eventType: 'ticket.updated';
  version: string;
  timestamp: string;
  ticketId: number;
  title: string;
  estado: string;
  updatedBy?: number;
  updatedFields?: string[];
}

export class TicketUpdatedEventFactory {
  static create(ticket: { id: number; title: string; estado: string }, updatedBy?: number, updatedFields?: string[]): TicketUpdatedEvent {
    return {
      eventType: 'ticket.updated',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ticketId: ticket.id,
      title: ticket.title,
      estado: ticket.estado,
      updatedBy,
      updatedFields
    };
  }
}

