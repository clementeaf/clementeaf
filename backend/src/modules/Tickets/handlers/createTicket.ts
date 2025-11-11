import { type APIGatewayProxyEvent } from 'aws-lambda';
import { TicketsService } from '../services/TicketsService';
import { AuthService } from '../../Users/services/AuthService';
import { WebSocketService } from '../../Chat/services/WebSocketService';
import { type CreateTicketDto } from '../dto/CreateTicketDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { extractToken, validateToken } from '../../Users/utils/auth';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para crear un nuevo ticket
 * @param event - Evento de API Gateway
 * @returns Respuesta con ticket creado
 */
const createTicketHandler = async (event: APIGatewayProxyEvent) => {
  const tokenError = validateToken(event);
  if (tokenError) return tokenError;

  const token = extractToken(event)!;
  const authService = new AuthService();
  const user = await authService.verifyToken(token);

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const createTicketDto = parseBody<CreateTicketDto>(event.body!);
  if (!createTicketDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  // Validar campos requeridos
  const requiredFields = ['title', 'description', 'type', 'priority'];
  const validationError = validateRequiredFields(createTicketDto as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const ticketsService = new TicketsService();
  const ticket = await ticketsService.createTicket(createTicketDto, user.id);

  // STREAMING: Notificar creación de ticket vía WebSocket (no bloqueante)
  // Notificamos al usuario asignado si existe
  if (ticket.assigneeId) {
    (async () => {
      try {
        console.log(`🔄 STREAMING: Ticket creado (ID: ${ticket.id}), notificando vía WebSocket al asignado...`);
        
        const webSocketService = new WebSocketService();
        
        const connections = await webSocketService.getUserConnections(ticket.assigneeId!);
        
        await Promise.allSettled(
          connections.map(connectionId =>
            webSocketService.sendToConnection(connectionId, {
              action: 'ticketCreated',
              ticket: {
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
              }
            })
          )
        );
        
        console.log(`✅ STREAMING: Ticket notificado vía WebSocket al usuario asignado`);
      } catch (error) {
        // Si falla el envío WebSocket, no fallamos la creación del ticket
        console.error('❌ Error enviando notificación vía WebSocket (STREAMING):', error);
      }
    })();
  }

  return successResponse(
    201,
    {
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
    },
    'Ticket creado exitosamente'
  );
};

export const handler = handlerWrapper(createTicketHandler);

