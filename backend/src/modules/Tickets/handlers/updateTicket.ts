import { type APIGatewayProxyEvent } from 'aws-lambda';
import { TicketsService } from '../services/TicketsService';
import { WebSocketService } from '../../Chat/services/WebSocketService';
import { type UpdateTicketDto } from '../dto/UpdateTicketDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { EventPublisher } from '../../Quotes/services/EventPublisher';
import { TicketUpdatedEventFactory, TicketStatusChangedEventFactory } from '../events';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para actualizar un ticket
 * @param event - Evento de API Gateway
 * @returns Respuesta con ticket actualizado
 */
const updateTicketHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID del ticket es requerido');
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return errorResponse(400, 'ID del ticket debe ser un número válido');
  }

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const updateTicketDto = parseBody<UpdateTicketDto>(event.body!);
  if (!updateTicketDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const ticketsService = new TicketsService();
  
  // Obtener el ticket anterior para comparar cambios
  const previousTicket = await ticketsService.getTicketById(ticketId);
  
  const ticket = await ticketsService.updateTicket(ticketId, updateTicketDto);

  // Obtener userId del token si está disponible
  let updatedBy: number | undefined;
  try {
    const token = extractToken(event);
    if (token) {
      const authService = new AuthService();
      const verifiedUser = await authService.verifyToken(token);
      const usersService = new (await import('../../Users/services/UsersService')).UsersService();
      const user = await usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        updatedBy = user.id;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener userId del token:', error);
  }

  // STREAMING: Notificar cambios vía WebSocket (no bloqueante)
  // Notificamos cuando cambia el estado o la asignación del ticket
  const hasStatusChanged = updateTicketDto.status && updateTicketDto.status !== previousTicket.status;
  
  // Publicar eventos (no bloqueante)
  const eventPublisher = new EventPublisher();
  const updatedFields = Object.keys(updateTicketDto);

  if (hasStatusChanged) {
    const statusChangedEvent = TicketStatusChangedEventFactory.create(
      {
        id: ticket.id,
        title: ticket.title
      },
      previousTicket.status,
      updateTicketDto.status!,
      updatedBy
    );

    eventPublisher.publish('ticket.status_changed', statusChangedEvent)
      .then(success => {
        if (success) {
          console.log(`✅ Evento ticket.status_changed publicado para ticket ID: ${ticket.id}`);
        } else {
          console.error(`❌ Error publicando evento ticket.status_changed para ticket ID: ${ticket.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error publicando evento ticket.status_changed:`, error);
      });
  } else if (updatedFields.length > 0) {
    const updatedEvent = TicketUpdatedEventFactory.create(
      {
        id: ticket.id,
        title: ticket.title,
        estado: ticket.status
      },
      updatedBy,
      updatedFields
    );

    eventPublisher.publish('ticket.updated', updatedEvent)
      .then(success => {
        if (success) {
          console.log(`✅ Evento ticket.updated publicado para ticket ID: ${ticket.id}`);
        } else {
          console.error(`❌ Error publicando evento ticket.updated para ticket ID: ${ticket.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error publicando evento ticket.updated:`, error);
      });
  }
  const hasAssigneeChanged = updateTicketDto.assigneeId !== undefined && updateTicketDto.assigneeId !== previousTicket.assigneeId;

  if (hasStatusChanged || hasAssigneeChanged) {
    (async () => {
      try {
        console.log(`🔄 STREAMING: Ticket actualizado (ID: ${ticket.id}), notificando vía WebSocket...`);
        
        const webSocketService = new WebSocketService();
        
        // Lista de usuarios a notificar: reporter y assignee (si existe)
        const usersToNotify: number[] = [ticket.reporterId];
        
        if (ticket.assigneeId) {
          usersToNotify.push(ticket.assigneeId);
        }
        
        // También notificar al assignee anterior si cambió
        if (hasAssigneeChanged && previousTicket.assigneeId && previousTicket.assigneeId !== ticket.assigneeId) {
          usersToNotify.push(previousTicket.assigneeId);
        }

        // Enviar notificación a todos los usuarios relevantes
        const notificationPromises = usersToNotify.map(async (userId) => {
          const connections = await webSocketService.getUserConnections(userId);
          return Promise.allSettled(
            connections.map(connectionId =>
              webSocketService.sendToConnection(connectionId, {
                action: 'ticketUpdated',
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
                },
                changes: {
                  statusChanged: hasStatusChanged,
                  assigneeChanged: hasAssigneeChanged
                }
              })
            )
          );
        });

        await Promise.all(notificationPromises);
        
        console.log(`✅ STREAMING: Ticket notificado vía WebSocket a los usuarios relevantes`);
      } catch (error) {
        // Si falla el envío WebSocket, no fallamos la actualización del ticket
        console.error('❌ Error enviando notificación vía WebSocket (STREAMING):', error);
      }
    })();
  }

  return successResponse(
    200,
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
    'Ticket actualizado exitosamente'
  );
};

export const handler = handlerWrapper(updateTicketHandler);

