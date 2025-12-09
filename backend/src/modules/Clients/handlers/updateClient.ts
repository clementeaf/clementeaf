import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { type CreateClientDto } from '../dto/CreateClientDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { EventPublisher } from '../../Quotes/services/EventPublisher';
import { ClientUpdatedEventFactory } from '../events/ClientUpdatedEvent';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para actualizar un cliente
 * @param event - Evento de API Gateway
 * @returns Respuesta con cliente actualizado
 */
const updateClientHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID del cliente es requerido');
  }

  const clientId = parseInt(id, 10);
  if (isNaN(clientId)) {
    return errorResponse(400, 'ID del cliente debe ser un número válido');
  }

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const updateData = parseBody<Partial<CreateClientDto>>(event.body!);
  if (!updateData) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const clientsService = new ClientsService();
  const client = await clientsService.updateClient(clientId, updateData);

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

  // Publicar evento de actualización (no bloqueante)
  const eventPublisher = new EventPublisher();
  const updatedFields = Object.keys(updateData);
  const updatedEvent = ClientUpdatedEventFactory.create(
    {
      id: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente
    },
    updatedBy,
    updatedFields
  );

  eventPublisher.publish('client.updated', updatedEvent)
    .then(success => {
      if (success) {
        console.log(`✅ Evento client.updated publicado para client ID: ${client.id}`);
      } else {
        console.error(`❌ Error publicando evento client.updated para client ID: ${client.id}`);
      }
    })
    .catch(error => {
      console.error(`❌ Error publicando evento client.updated:`, error);
    });

  return successResponse(
    200,
    {
      id: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente,
      rutCompleto: client.rutCompleto,
      giro: client.giro,
      sitioWeb: client.sitioWeb,
      createdAt: client.createdAt?.toISOString(),
      updatedAt: client.updatedAt?.toISOString()
    },
    'Cliente actualizado exitosamente'
  );
};

export const handler = handlerWrapper(updateClientHandler);

