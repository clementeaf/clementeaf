import { TicketType, TicketPriority } from '../entities/Ticket.entity';

/**
 * DTO para crear un ticket
 */
export interface CreateTicketDto {
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  images?: string[];
  assigneeId?: number;
}

