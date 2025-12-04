import { type APIGatewayProxyEvent } from 'aws-lambda';
import { UsersService } from '../services/UsersService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { validateBody, parseBody } from '../utils/validation';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para actualizar el rol de un usuario
 * @param event - Evento de API Gateway
 * @returns Usuario actualizado
 */
const updateUserRoleHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = parseInt(event.pathParameters?.id || '', 10);
    
    if (isNaN(id)) {
      return errorResponse(400, 'ID de usuario inválido');
    }

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const body = parseBody<{ roleId: number | null }>(event.body!);

    if (!body) {
      return errorResponse(400, 'Invalid JSON format');
    }

    if (body.roleId !== null && body.roleId !== undefined && (typeof body.roleId !== 'number' || isNaN(body.roleId))) {
      return errorResponse(400, 'roleId debe ser un número o null');
    }

    const usersService = new UsersService();
    const user = await usersService.updateUserRole(id, body.roleId ?? null);

    return successResponse(200, { user }, 'Rol actualizado exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar rol';
    console.error('Error en updateUserRoleHandler:', error);
    
    if (errorMessage.includes('no encontrado')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(updateUserRoleHandler);

