import { type APIGatewayProxyEvent } from 'aws-lambda';
import { TicketsService } from '../services/TicketsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para eliminar un ticket
 * @param event - Evento de API Gateway
 * @returns Respuesta de confirmación
 */
const deleteTicketHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID del ticket es requerido');
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return errorResponse(400, 'ID del ticket debe ser un número válido');
  }

  const ticketsService = new TicketsService();
  await ticketsService.deleteTicket(ticketId);

  return successResponse(200, null, 'Ticket eliminado exitosamente');
};

export const handler = handlerWrapper(deleteTicketHandler);

