import type { Ticket } from './types';

interface KanbanCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

/**
 * Componente para mostrar una tarjeta en el tablero Kanban
 * @param ticket - Ticket a mostrar
 * @param onClick - Función que se ejecuta al hacer click en la tarjeta
 * @returns Componente KanbanCard
 */
export const KanbanCard = ({ ticket, onClick }: KanbanCardProps) => {
  const getTypeColor = (type: Ticket['type']): string => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'optimization':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'feature':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(ticket.type)}`}>
            {ticket.type === 'bug' ? 'Bug' : ticket.type === 'optimization' ? 'Optimización' : 'Feature'}
          </span>
          <span className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} title={ticket.priority}></span>
        </div>
        <span className="text-xs text-gray-500">#{ticket.id}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{ticket.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        {ticket.assigneeId && (
          <span className="px-2 py-1 bg-gray-100 rounded">Asignado</span>
        )}
      </div>
    </div>
  );
};

