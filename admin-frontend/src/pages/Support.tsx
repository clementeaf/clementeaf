import { useState } from 'react';
import type { Ticket, TicketType, TicketPriority } from './Support/types';
import { KanbanBoard } from './Support/KanbanBoard';
import { CreateTicketModal } from './Support/CreateTicketModal';
import { Button, PlusIcon } from '../components/commons';

/**
 * Página de Soporte
 * @returns Componente Support
 */
export const Support = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

  const handleTicketClick = (ticket: Ticket): void => {
    console.log('Ticket clicked:', ticket);
    // TODO: Abrir modal de detalles del ticket
  };

  const handleCreateTicket = (ticketData: {
    title: string;
    description: string;
    type: TicketType;
    priority: TicketPriority;
  }): void => {
    const newTicket: Ticket = {
      id: Date.now(), // TODO: Usar ID del backend
      title: ticketData.title,
      description: ticketData.description,
      type: ticketData.type,
      priority: ticketData.priority,
      status: 'requested',
      reporterId: 1, // TODO: Usar ID del usuario actual
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTickets([...tickets, newTicket]);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Soporte</h1>
            <p className="text-sm text-gray-600 mt-1">Gestión de bugs, optimizaciones y mejoras</p>
          </div>
          <Button
            onClick={() => setIsCreateTicketModalOpen(true)}
            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 flex items-center gap-2"
            leftIcon={<PlusIcon />}
          >
            Crear Ticket
          </Button>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <KanbanBoard tickets={tickets} onTicketClick={handleTicketClick} />
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  );
};

