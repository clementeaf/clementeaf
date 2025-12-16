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

    const body = JSON.parse(event.body || '{}');
    const { name, description, moduleScopes, canDelegatePermissions, capabilities } = body;

    if (!name) {
      return errorResponse(400, 'El nombre del rol es requerido');
    }

    const dynamicRolesService = new DynamicRolesService();
    const role = await dynamicRolesService.createDynamicRole({
      name,
      description,
      moduleScopes,
      canDelegatePermissions,
      capabilities
    });

    return successResponse(201, {
      message: 'Rol dinámico creado exitosamente',
      role
    });
  } catch (error) {
    console.error('Error creating dynamic role:', error);
    const message = error instanceof Error ? error.message : 'Error al crear rol dinámico';
    return errorResponse(500, message);
  }
};
