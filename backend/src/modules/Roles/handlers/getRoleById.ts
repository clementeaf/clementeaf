import { type APIGatewayProxyEvent } from 'aws-lambda';
import { RolesService } from '../services/RolesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener un rol por su ID
 * @param event - Evento de API Gateway
 * @returns Rol encontrado
 */
const getRoleByIdHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = parseInt(event.pathParameters?.id || '', 10);
    
    if (isNaN(id)) {
      return errorResponse(400, 'ID de rol inválido');
    }

    const rolesService = new RolesService();
    const role = await rolesService.getRoleById(id);
    return successResponse(200, { role });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener rol';
    console.error('Error en getRoleByIdHandler:', error);
    
    if (errorMessage.includes('no encontrado')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getRoleByIdHandler);

