/**
 * Re-exportar tipos del servicio de tickets para mantener consistencia
 */
export type {
  Ticket,
  TicketUser,
  CreateTicketDto,
  UpdateTicketDto,
  PaginatedTicketsResponse
} from '../../services/ticketsService';

/**
 * Tipos de estado de un ticket
 */
export type TicketStatus = 'requested' | 'in-progress' | 'testing' | 'production';

/**
 * Tipo de ticket
 */
export type TicketType = 'bug' | 'optimization' | 'feature';

/**
 * Prioridad del ticket
 */
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

