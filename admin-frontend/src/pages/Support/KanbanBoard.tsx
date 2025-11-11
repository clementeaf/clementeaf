import type { Ticket, TicketStatus } from './types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

/**
 * Configuración de las columnas del tablero Kanban
 */
const columns: Array<{ title: string; status: TicketStatus }> = [
  { title: 'Solicitado', status: 'requested' },
  { title: 'En Curso', status: 'in-progress' },
  { title: 'En Testing', status: 'testing' },
  { title: 'En Producción', status: 'production' }
];

/**
 * Componente para mostrar el tablero Kanban
 * @param tickets - Lista de todos los tickets
 * @param onTicketClick - Función que se ejecuta al hacer click en un ticket
 * @returns Componente KanbanBoard
 */
export const KanbanBoard = ({ tickets, onTicketClick }: KanbanBoardProps) => {
  const getTicketsByStatus = (status: TicketStatus): Ticket[] => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <div className="flex gap-4 h-full">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tickets={getTicketsByStatus(column.status)}
          onTicketClick={onTicketClick}
        />
      ))}
    </div>
  );
};

