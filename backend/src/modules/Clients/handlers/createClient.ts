import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { type CreateClientDto } from '../dto/CreateClientDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

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

