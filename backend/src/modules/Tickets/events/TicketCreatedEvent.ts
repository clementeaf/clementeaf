export interface TicketCreatedEvent {
  eventType: 'ticket.created';
  version: string;
  timestamp: string;
  ticketId: number;
  title: string;
  type: string;
  priority: string;
  estado: string;
  createdBy?: number;
  assigneeId?: number;
}

export class TicketCreatedEventFactory {
  static create(ticket: { id: number; title: string; type: string; priority: string; estado: string; assigneeId?: number }, createdBy?: number): TicketCreatedEvent {
    return {
      eventType: 'ticket.created',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ticketId: ticket.id,
      title: ticket.title,
      type: ticket.type,
      priority: ticket.priority,
      estado: ticket.estado,
      createdBy,
      assigneeId: ticket.assigneeId
    };
  }
}

