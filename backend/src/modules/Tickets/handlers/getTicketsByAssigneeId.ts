import { type APIGatewayProxyEvent } from 'aws-lambda';
import { TicketsService } from '../services/TicketsService';
import { AuthService } from '../../Users/services/AuthService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { extractToken, validateToken } from '../../Users/utils/auth';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todos los tickets asignados a un usuario
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de tickets paginada
 */
const getTicketsByAssigneeIdHandler = async (event: APIGatewayProxyEvent) => {
  const tokenError = validateToken(event);
  if (tokenError) return tokenError;

  const token = extractToken(event)!;
  const authService = new AuthService();
  const user = await authService.verifyToken(token);

  const queryParams = event.queryStringParameters || {};
  
  const page = queryParams.page ? parseInt(queryParams.page, 10) : 1;
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;

  if (isNaN(page) || page < 1) {
    return successResponse(400, null, 'El parámetro page debe ser un número mayor a 0');
  }

  if (isNaN(limit) || limit < 1) {
    return successResponse(400, null, 'El parámetro limit debe ser un número mayor a 0');
  }

  const ticketsService = new TicketsService();
  const result = await ticketsService.getTicketsByAssigneeId(user.id, page, limit);

  return successResponse(200, {
    data: result.data.map(ticket => ({
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
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages
  });
};

export const handler = handlerWrapper(getTicketsByAssigneeIdHandler);

