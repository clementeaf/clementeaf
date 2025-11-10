import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

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
  await clientsService.deleteClient(clientId);

  return successResponse(200, null, 'Cliente eliminado exitosamente');
};

export const handler = handlerWrapper(deleteClientHandler);

