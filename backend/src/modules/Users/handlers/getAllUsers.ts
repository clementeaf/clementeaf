import { type APIGatewayProxyEvent } from 'aws-lambda';
import { UsersService } from '../services/UsersService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { successResponse } from '../utils/response';

/**
 * Handler para obtener todos los usuarios con paginación
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de usuarios paginada
 */
const getAllUsersHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const page = queryParams.page ? parseInt(queryParams.page, 10) : 1;
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 100;

  if (isNaN(page) || page < 1) {
    return successResponse(400, null, 'El parámetro page debe ser un número mayor a 0');
  }

  if (isNaN(limit) || limit < 1) {
    return successResponse(400, null, 'El parámetro limit debe ser un número mayor a 0');
  }

  const usersService = new UsersService();
  const result = await usersService.getAllUsers(page, limit);

  return successResponse(200, {
    data: result.data.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages
  });
};

export const handler = handlerWrapper(getAllUsersHandler);

