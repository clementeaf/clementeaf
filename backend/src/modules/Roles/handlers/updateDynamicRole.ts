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

    const body = JSON.parse(event.body || '{}');
    const { name, description, isActive, moduleScopes, canDelegatePermissions } = body;

    const dynamicRolesService = new DynamicRolesService();
    const role = await dynamicRolesService.updateDynamicRole(
      parseInt(roleId),
      { name, description, isActive, moduleScopes, canDelegatePermissions }
    );

    return successResponse(200, {
      message: 'Rol actualizado exitosamente',
      role
    });
  } catch (error) {
    console.error('Error updating dynamic role:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar rol';
    return errorResponse(500, message);
  }
};
