import { type APIGatewayProxyEvent } from 'aws-lambda';
import { PermissionsService } from '../services/PermissionsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener las capacidades disponibles del sistema
 * @param event - Evento de API Gateway
 * @returns Lista de capacidades disponibles
 */
const getAvailableCapabilitiesHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const permissionsService = new PermissionsService();
    const capabilities = await permissionsService.getAvailableCapabilities();
    return successResponse(200, { capabilities });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener capacidades';
    console.error('Error en getAvailableCapabilitiesHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getAvailableCapabilitiesHandler);

