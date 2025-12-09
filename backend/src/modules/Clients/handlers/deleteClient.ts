import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { EventPublisher } from '../../Quotes/services/EventPublisher';
import { ClientDeletedEventFactory } from '../events/ClientDeletedEvent';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para eliminar un cliente
 * @param event - Evento de API Gateway
 * @returns Respuesta de confirmación
 */
const deleteClientHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID del cliente es requerido');
  }

  const clientId = parseInt(id, 10);
  if (isNaN(clientId)) {
    return errorResponse(400, 'ID del cliente debe ser un número válido');
  }

  const clientsService = new ClientsService();
  
  // Obtener el cliente antes de eliminarlo para el evento
  const client = await clientsService.getClientById(clientId);
  
  // Obtener userId del token si está disponible
  let deletedBy: number | undefined;
  try {
    const token = extractToken(event);
    if (token) {
      const authService = new AuthService();
      const verifiedUser = await authService.verifyToken(token);
      const usersService = new (await import('../../Users/services/UsersService')).UsersService();
      const user = await usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        deletedBy = user.id;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener userId del token:', error);
  }

  // Eliminar el cliente
  await clientsService.deleteClient(clientId);

  // Publicar evento de eliminación (no bloqueante)
  const eventPublisher = new EventPublisher();
  const deletedEvent = ClientDeletedEventFactory.create(
    {
      id: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente
    },
    deletedBy
  );

  eventPublisher.publish('client.deleted', deletedEvent)
    .then(success => {
      if (success) {
        console.log(`✅ Evento client.deleted publicado para client ID: ${client.id}`);
      } else {
        console.error(`❌ Error publicando evento client.deleted para client ID: ${client.id}`);
      }
    })
    .catch(error => {
      console.error(`❌ Error publicando evento client.deleted:`, error);
    });

  return successResponse(200, null, 'Cliente eliminado exitosamente');
};

export const handler = handlerWrapper(deleteClientHandler);

