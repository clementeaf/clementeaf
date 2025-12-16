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

    const parentRoleId = event.pathParameters?.id;
    if (!parentRoleId) {
      return errorResponse(400, 'ID de rol padre requerido');
    }

    const body = JSON.parse(event.body || '{}');
    const { childRoleId, moduleScope } = body;

    if (!childRoleId) {
      return errorResponse(400, 'ID de rol hijo requerido');
    }

    const dynamicRolesService = new DynamicRolesService();
    const hierarchy = await dynamicRolesService.setHierarchy(
      parseInt(parentRoleId),
      { childRoleId, moduleScope }
    );

    return successResponse(201, {
      message: 'Jerarquía establecida exitosamente',
      hierarchy
    });
  } catch (error) {
    console.error('Error setting hierarchy:', error);
    const message = error instanceof Error ? error.message : 'Error al establecer jerarquía';
    return errorResponse(500, message);
  }
};
