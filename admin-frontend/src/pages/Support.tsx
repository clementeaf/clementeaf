import { useState } from 'react';
import { toast } from 'react-toastify';
import type { Ticket, TicketType, TicketPriority } from './Support/types';
import { KanbanBoard } from './Support/KanbanBoard';
import { CreateTicketModal } from './Support/CreateTicketModal';
import { TicketDetailsModal } from './Support/TicketDetailsModal';
import { useAllTickets, useCreateTicket } from '../hooks/useTickets';
import { Button, PlusIcon } from '../components/commons';

/**
 * Página de Soporte
 * @returns Componente Support
 */
export const Support = () => {
  const { data: ticketsData, isLoading } = useAllTickets(1, 100);
  const createTicketMutation = useCreateTicket();
  
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false);

  const tickets = ticketsData?.data ?? [];

  const handleTicketClick = (ticket: Ticket): void => {
    setSelectedTicket(ticket);
    setIsTicketDetailsModalOpen(true);
  };

  const handleCreateTicket = async (ticketData: {
    title: string;
    description: string;
    type: TicketType;
    priority: TicketPriority;
  }): Promise<void> => {
    try {
      await createTicketMutation.mutateAsync({
        title: ticketData.title,
        description: ticketData.description,
        type: ticketData.type,
        priority: ticketData.priority
      });
      
      toast.success('Ticket creado exitosamente');
      setIsCreateTicketModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el ticket';
      toast.error(errorMessage);
    }
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
        <div className="flex-1 p-6 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Cargando tickets...</div>
            </div>
          ) : (
            <KanbanBoard tickets={tickets} onTicketClick={handleTicketClick} />
          )}
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onCreateTicket={handleCreateTicket}
      />

      <TicketDetailsModal
        isOpen={isTicketDetailsModalOpen}
        onClose={() => {
          setIsTicketDetailsModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />
    </div>
  );
};

