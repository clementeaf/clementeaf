import { type APIGatewayProxyEvent } from 'aws-lambda';
import { RolesService } from '../services/RolesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todos los roles
 * @param event - Evento de API Gateway
 * @returns Lista de roles
 */
const getAllRolesHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const rolesService = new RolesService();
    const roles = await rolesService.getAllRoles();
    return successResponse(200, { roles });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener roles';
    console.error('Error en getAllRolesHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getAllRolesHandler);

