import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamicRolesService } from '../services/DynamicRolesService';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { canDelegate } from '../middleware/capabilityCheck';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Verificar permisos de delegación
    const delegationCheck = await canDelegate(event);
    if (!delegationCheck.authorized) {
      return errorResponse(403, delegationCheck.message || 'No autorizado');
    }

    const roleId = event.pathParameters?.id;
    if (!roleId) {
      return errorResponse(400, 'ID de rol requerido');
    }

    const dynamicRolesService = new DynamicRolesService();
    await dynamicRolesService.deleteDynamicRole(parseInt(roleId));

    return successResponse(200, {
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting dynamic role:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar rol';
    return errorResponse(500, message);
  }
};
