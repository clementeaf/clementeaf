import { Modal } from '../../components/commons';
import type { Ticket } from './types';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

/**
 * Obtiene el color del tipo de ticket
 */
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

/**
 * Obtiene el color de la prioridad
 */
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

/**
 * Obtiene el label del tipo
 */
const getTypeLabel = (type: Ticket['type']): string => {
  switch (type) {
    case 'bug':
      return 'Bug';
    case 'optimization':
      return 'Optimización';
    case 'feature':
      return 'Feature';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el label de la prioridad
 */
const getPriorityLabel = (priority: Ticket['priority']): string => {
  switch (priority) {
    case 'critical':
      return 'Crítica';
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return 'Desconocida';
  }
};

/**
 * Obtiene el label del estado
 */
const getStatusLabel = (status: Ticket['status']): string => {
  switch (status) {
    case 'requested':
      return 'Solicitado';
    case 'in-progress':
      return 'En Curso';
    case 'testing':
      return 'En Testing';
    case 'production':
      return 'En Producción';
    default:
      return 'Desconocido';
  }
};

/**
 * Modal para mostrar los detalles de un ticket
 * @param isOpen - Indica si el modal está abierto
 * @param onClose - Función para cerrar el modal
 * @param ticket - Ticket a mostrar
 * @returns Componente TicketDetailsModal
 */
export const TicketDetailsModal = ({ isOpen, onClose, ticket }: TicketDetailsModalProps) => {
  if (!ticket) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-3xl">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{ticket.title}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded border ${getTypeColor(ticket.type)}`}>
                {getTypeLabel(ticket.type)}
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}></span>
                <span className="text-sm text-gray-600">{getPriorityLabel(ticket.priority)}</span>
              </div>
              <span className="text-sm text-gray-500">#{ticket.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado</h3>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
              {getStatusLabel(ticket.status)}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Fecha de creación</h3>
              <p className="text-sm text-gray-600">
                {new Date(ticket.createdAt).toLocaleString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Última actualización</h3>
              <p className="text-sm text-gray-600">
                {new Date(ticket.updatedAt).toLocaleString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {ticket.assigneeId && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Asignado a</h3>
              <p className="text-sm text-gray-600">Usuario ID: {ticket.assigneeId}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

