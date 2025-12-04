import { type APIGatewayProxyEvent } from 'aws-lambda';
import { RolesService } from '../services/RolesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para actualizar un rol
 * @param event - Evento de API Gateway
 * @returns Rol actualizado
 */
const updateRoleHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = parseInt(event.pathParameters?.id || '', 10);
    
    if (isNaN(id)) {
      return errorResponse(400, 'ID de rol inválido');
    }

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const body = parseBody<{
      name?: string;
      description?: string;
      isActive?: boolean;
      permissionIds?: number[];
    }>(event.body!);

    if (!body) {
      return errorResponse(400, 'Invalid JSON format');
    }

    const rolesService = new RolesService();
    const role = await rolesService.updateRole(id, body);

    return successResponse(200, { role }, 'Rol actualizado exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar rol';
    console.error('Error en updateRoleHandler:', error);
    
    if (errorMessage.includes('no encontrado')) {
      return errorResponse(404, errorMessage);
    }
    
    if (errorMessage.includes('Ya existe')) {
      return errorResponse(409, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(updateRoleHandler);

