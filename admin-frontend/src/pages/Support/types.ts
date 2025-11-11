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

/**
 * Ticket de soporte
 */
export interface Ticket {
  id: number;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  reporterId: number;
  assigneeId?: number;
  createdAt: string;
  updatedAt: string;
}

