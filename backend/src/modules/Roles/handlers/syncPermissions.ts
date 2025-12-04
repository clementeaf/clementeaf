import { type APIGatewayProxyEvent } from 'aws-lambda';
import { PermissionsService } from '../services/PermissionsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para sincronizar permisos desde las capacidades descubiertas
 * @param event - Evento de API Gateway
 * @returns Lista de permisos sincronizados
 */
const syncPermissionsHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const permissionsService = new PermissionsService();
    const permissions = await permissionsService.syncPermissionsFromCapabilities();
    return successResponse(200, { permissions }, 'Permisos sincronizados exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al sincronizar permisos';
    console.error('Error en syncPermissionsHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(syncPermissionsHandler);

