import { type APIGatewayProxyEvent } from 'aws-lambda';
import { RolesService } from '../services/RolesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para eliminar un rol
 * @param event - Evento de API Gateway
 * @returns Confirmación de eliminación
 */
const deleteRoleHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = parseInt(event.pathParameters?.id || '', 10);
    
    if (isNaN(id)) {
      return errorResponse(400, 'ID de rol inválido');
    }

    const rolesService = new RolesService();
    await rolesService.deleteRole(id);

    return successResponse(200, {}, 'Rol eliminado exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar rol';
    console.error('Error en deleteRoleHandler:', error);
    
    if (errorMessage.includes('no encontrado')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(deleteRoleHandler);

