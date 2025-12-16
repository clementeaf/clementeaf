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

    const roleId = event.pathParameters?.id;
    if (!roleId) {
      return errorResponse(400, 'ID de rol requerido');
    }

    const body = JSON.parse(event.body || '{}');
    const { capabilities, replace } = body;

    if (!capabilities || !Array.isArray(capabilities)) {
      return errorResponse(400, 'Capabilities debe ser un array');
    }

    const dynamicRolesService = new DynamicRolesService();
    
    let result;
    if (replace) {
      // Reemplazar todas las capabilities
      result = await dynamicRolesService.replaceCapabilities(
        parseInt(roleId),
        capabilities
      );
    } else {
      // Agregar capabilities
      result = await dynamicRolesService.assignCapabilities(
        parseInt(roleId),
        capabilities
      );
    }

    return successResponse(200, {
      message: 'Capabilities asignadas exitosamente',
      capabilities: result
    });
  } catch (error) {
    console.error('Error assigning capabilities:', error);
    const message = error instanceof Error ? error.message : 'Error al asignar capabilities';
    return errorResponse(500, message);
  }
};
