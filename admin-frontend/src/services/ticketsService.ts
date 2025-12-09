import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * DTO para crear un ticket
 */
export interface CreateTicketDto {
  title: string;
  description: string;
  type: 'bug' | 'optimization' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'critical';
  images?: string[];
  assigneeId?: number;
}

/**
 * DTO para actualizar un ticket
 */
export interface UpdateTicketDto {
  title?: string;
  description?: string;
  type?: 'bug' | 'optimization' | 'feature';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'requested' | 'in-progress' | 'testing' | 'production';
  assigneeId?: number | null;
  images?: string[] | null;
}

/**
 * Usuario (reporter o assignee)
 */
export interface TicketUser {
  id: number;
  email: string;
  name: string | null;
}

/**
 * Ticket de soporte
 */
export interface Ticket {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'optimization' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'requested' | 'in-progress' | 'testing' | 'production';
  reporterId: number;
  reporter: TicketUser;
  assigneeId: number | null;
  assignee: TicketUser | null;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de tickets
 */
export interface PaginatedTicketsResponse {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para interactuar con la API de Tickets
 */
export const ticketsService = {
  /**
   * Crea un nuevo ticket
   */
  createTicket: async (createTicketDto: CreateTicketDto): Promise<Ticket> => {
    const response = await apiClient.post(endpoints.tickets.create, createTicketDto);
    return response.data.data;
  },

  /**
   * Obtiene un ticket por su ID
   */
  getTicketById: async (id: number): Promise<Ticket> => {
    const url = endpoints.tickets.getById.replace('{id}', id.toString());
    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Obtiene todos los tickets con paginación
   */
  getAllTickets: async (
    page: number = 1,
    limit: number = 50,
    status?: string,
    type?: string
  ): Promise<PaginatedTicketsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }
    
    if (type) {
      params.append('type', type);
    }

    const response = await apiClient.get(`${endpoints.tickets.getAll}?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Obtiene todos los tickets creados por el usuario autenticado
   */
  getTicketsByReporterId: async (
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedTicketsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await apiClient.get(`${endpoints.tickets.getByReporter}?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Obtiene todos los tickets asignados al usuario autenticado
   */
  getTicketsByAssigneeId: async (
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedTicketsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await apiClient.get(`${endpoints.tickets.getByAssignee}?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Actualiza un ticket
   */
  updateTicket: async (id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> => {
    const url = endpoints.tickets.update.replace('{id}', id.toString());
    const response = await apiClient.put(url, updateTicketDto);
    return response.data.data;
  },

  /**
   * Elimina un ticket
   */
  deleteTicket: async (id: number): Promise<void> => {
    const url = endpoints.tickets.delete.replace('{id}', id.toString());
    await apiClient.delete(url);
  }
};

