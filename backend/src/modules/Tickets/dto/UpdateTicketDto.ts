import { TicketType, TicketPriority, TicketStatus } from '../entities/Ticket.entity';

/**
 * DTO para actualizar un ticket
 */
export interface UpdateTicketDto {
  title?: string;
  description?: string;
  type?: TicketType;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigneeId?: number | null;
  images?: string[] | null;
}

