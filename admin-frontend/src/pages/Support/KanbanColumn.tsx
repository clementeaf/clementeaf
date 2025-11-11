import type { Ticket, TicketStatus } from './types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: TicketStatus;
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

/**
 * Componente para mostrar una columna en el tablero Kanban
 * @param title - Título de la columna
 * @param status - Estado de los tickets en esta columna
 * @param tickets - Lista de tickets en esta columna
 * @param onTicketClick - Función que se ejecuta al hacer click en un ticket
 * @returns Componente KanbanColumn
 */
export const KanbanColumn = ({ title, status, tickets, onTicketClick }: KanbanColumnProps) => {
  return (
    <div className="flex-1 bg-gray-50 rounded-lg p-4 min-w-[280px] flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
        <span className="text-sm text-gray-500">{tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick?.(ticket)}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-8 text-sm">No hay tickets</div>
        )}
      </div>
    </div>
  );
};

