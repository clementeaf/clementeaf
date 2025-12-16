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

    const dynamicRolesService = new DynamicRolesService();
    const roles = await dynamicRolesService.getAllDynamicRoles();

    return successResponse(200, {
      roles,
      count: roles.length
    });
  } catch (error) {
    console.error('Error getting dynamic roles:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener roles dinámicos';
    return errorResponse(500, message);
  }
};
