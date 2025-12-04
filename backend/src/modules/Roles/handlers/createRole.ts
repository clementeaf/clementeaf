import { type APIGatewayProxyEvent } from 'aws-lambda';
import { RolesService } from '../services/RolesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para crear un nuevo rol
 * @param event - Evento de API Gateway
 * @returns Rol creado
 */
const createRoleHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const body = parseBody<{
      name: string;
      description?: string;
      permissionIds?: number[];
    }>(event.body!);

    if (!body) {
      return errorResponse(400, 'Invalid JSON format');
    }

    if (!body.name || typeof body.name !== 'string') {
      return errorResponse(400, 'El nombre del rol es requerido');
    }

    const rolesService = new RolesService();
    const role = await rolesService.createRole({
      name: body.name,
      description: body.description,
      permissionIds: body.permissionIds
    });

    return successResponse(201, { role }, 'Rol creado exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear rol';
    console.error('Error en createRoleHandler:', error);
    
    if (errorMessage.includes('Ya existe')) {
      return errorResponse(409, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(createRoleHandler);

