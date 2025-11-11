import { type APIGatewayProxyEvent } from 'aws-lambda';
import { TicketsService } from '../services/TicketsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener un ticket por su ID
 * @param event - Evento de API Gateway
 * @returns Respuesta con ticket encontrado
 */
const getTicketByIdHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID del ticket es requerido');
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return errorResponse(400, 'ID del ticket debe ser un número válido');
  }

  const ticketsService = new TicketsService();
  const ticket = await ticketsService.getTicketById(ticketId);

  return successResponse(200, {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    priority: ticket.priority,
    status: ticket.status,
    reporterId: ticket.reporterId,
    reporter: {
      id: ticket.reporter.id,
      email: ticket.reporter.email,
      name: ticket.reporter.name
    },
    assigneeId: ticket.assigneeId,
    assignee: ticket.assignee ? {
      id: ticket.assignee.id,
      email: ticket.assignee.email,
      name: ticket.assignee.name
    } : null,
    images: ticket.images,
    createdAt: ticket.createdAt?.toISOString(),
    updatedAt: ticket.updatedAt?.toISOString()
  });
};

export const handler = handlerWrapper(getTicketByIdHandler);

