import { type APIGatewayProxyEvent } from 'aws-lambda';
import { PermissionsService } from '../services/PermissionsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todos los permisos
 * @param event - Evento de API Gateway
 * @returns Lista de permisos
 */
const getAllPermissionsHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const permissionsService = new PermissionsService();
    const permissions = await permissionsService.getAllPermissions();
    return successResponse(200, { permissions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener permisos';
    console.error('Error en getAllPermissionsHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getAllPermissionsHandler);

