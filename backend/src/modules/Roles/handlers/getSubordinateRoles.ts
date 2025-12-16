import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamicRolesService } from '../services/DynamicRolesService';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { getUserWithPermissions } from '../../Users/utils/permissions';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const user = await getUserWithPermissions(event);
    if (!user) {
      return errorResponse(401, 'No autorizado');
    }

    const roleId = event.pathParameters?.id;
    if (!roleId) {
      return errorResponse(400, 'ID de rol requerido');
    }

    const dynamicRolesService = new DynamicRolesService();
    const subordinateRoles = await dynamicRolesService.getSubordinateRoles(
      parseInt(roleId)
    );

    return successResponse(200, {
      roles: subordinateRoles,
      count: subordinateRoles.length
    });
  } catch (error) {
    console.error('Error getting subordinate roles:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener roles subordinados';
    return errorResponse(500, message);
  }
};
