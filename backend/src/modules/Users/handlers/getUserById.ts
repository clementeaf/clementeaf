import { type APIGatewayProxyEvent } from 'aws-lambda';
import { UsersService } from '../services/UsersService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { successResponse, errorResponse } from '../utils/response';

/**
 * Handler para obtener un usuario por su ID
 * @param event - Evento de API Gateway
 * @returns Respuesta con usuario encontrado
 */
const getUserByIdHandler = async (event: APIGatewayProxyEvent) => {
  const pathParameters = event.pathParameters || {};
  const id = pathParameters.id;

  if (!id) {
    return errorResponse(400, 'ID de usuario es requerido');
  }

  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return errorResponse(400, 'ID de usuario inválido');
  }

  try {
    const usersService = new UsersService();
    const user = await usersService.getUserById(userId);

    return successResponse(200, {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        isActive: user.role.isActive
      } : null,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no encontrado') {
      return errorResponse(404, 'Usuario no encontrado');
    }
    throw error;
  }
};

export const handler = handlerWrapper(getUserByIdHandler);

