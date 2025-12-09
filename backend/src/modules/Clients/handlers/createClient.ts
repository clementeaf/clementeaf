import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { type CreateClientDto } from '../dto/CreateClientDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { EventPublisher } from '../../Quotes/services/EventPublisher';
import { ClientCreatedEventFactory } from '../events/ClientCreatedEvent';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para crear un nuevo cliente
 * @param event - Evento de API Gateway
 * @returns Respuesta con cliente creado
 */
const createClientHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const createClientDto = parseBody<CreateClientDto>(event.body!);
  if (!createClientDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  // Validar campos requeridos
  const requiredFields = ['rut', 'razonSocial', 'nombreCliente', 'rutCompleto', 'giro'];
  const validationError = validateRequiredFields(createClientDto as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const clientsService = new ClientsService();
  const client = await clientsService.createClient(createClientDto);

  // Obtener userId del token si está disponible
  let createdBy: number | undefined;
  try {
    const token = extractToken(event);
    if (token) {
      const authService = new AuthService();
      const verifiedUser = await authService.verifyToken(token);
      const usersService = new (await import('../../Users/services/UsersService')).UsersService();
      const user = await usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        createdBy = user.id;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener userId del token:', error);
  }

  // Publicar evento de creación (no bloqueante)
  const eventPublisher = new EventPublisher();
  const createdEvent = ClientCreatedEventFactory.create(
    {
      id: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente
    },
    createdBy
  );

  eventPublisher.publish('client.created', createdEvent)
    .then(success => {
      if (success) {
        console.log(`✅ Evento client.created publicado para client ID: ${client.id}`);
      } else {
        console.error(`❌ Error publicando evento client.created para client ID: ${client.id}`);
      }
    })
    .catch(error => {
      console.error(`❌ Error publicando evento client.created:`, error);
    });

  return successResponse(
    201,
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
    'Cliente creado exitosamente'
  );
};

export const handler = handlerWrapper(createClientHandler);

