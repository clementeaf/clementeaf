import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { type CreateClientDto } from '../dto/CreateClientDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

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

