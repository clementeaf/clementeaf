import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService, type CreateTicketDto, type UpdateTicketDto } from '../services/ticketsService';

/**
 * Hook para crear un ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createTicketDto: CreateTicketDto) => ticketsService.createTicket(createTicketDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  });
};

/**
 * Hook para obtener un ticket por ID
 */
export const useTicketById = (id: number | null) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Ticket ID is required');
      }
      return ticketsService.getTicketById(id);
    },
    enabled: !!id
  });
};

/**
 * Hook para obtener todos los tickets
 */
export const useAllTickets = (
  page: number = 1,
  limit: number = 50,
  status?: string,
  type?: string
) => {
  return useQuery({
    queryKey: ['tickets', 'all', page, limit, status, type],
    queryFn: () => ticketsService.getAllTickets(page, limit, status, type)
  });
};

/**
 * Hook para obtener tickets del reporter (usuario autenticado)
 */
export const useTicketsByReporterId = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['tickets', 'reporter', page, limit],
    queryFn: () => ticketsService.getTicketsByReporterId(page, limit)
  });
};

/**
 * Hook para obtener tickets asignados al usuario autenticado
 */
export const useTicketsByAssigneeId = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['tickets', 'assignee', page, limit],
    queryFn: () => ticketsService.getTicketsByAssigneeId(page, limit)
  });
};

/**
 * Hook para actualizar un ticket
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateTicketDto }: { id: number; updateTicketDto: UpdateTicketDto }) =>
      ticketsService.updateTicket(id, updateTicketDto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.setQueryData(['tickets', data.id], data);
    }
  });
};

/**
 * Hook para eliminar un ticket
 */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketsService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  });
};

