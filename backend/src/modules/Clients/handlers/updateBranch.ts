import { type APIGatewayProxyEvent } from 'aws-lambda';
import { BranchService } from '../services/BranchService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import type { UpdateBranchDto } from '../dto/UpdateBranchDto';

/**
 * Handler para actualizar una sucursal
 * @param event - Evento de API Gateway
 * @returns Respuesta con sucursal actualizada
 */
const updateBranchHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const clientIdParam = event.pathParameters?.clientId;
    const branchIdParam = event.pathParameters?.id;

    if (!clientIdParam || !branchIdParam) {
      return errorResponse(400, 'ID del cliente y de la sucursal son requeridos');
    }

    const clientId = parseInt(clientIdParam, 10);
    const branchId = parseInt(branchIdParam, 10);
    
    if (isNaN(clientId) || isNaN(branchId)) {
      return errorResponse(400, 'IDs deben ser números válidos');
    }

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const dto = parseBody<UpdateBranchDto>(event.body!);
    if (!dto) {
      return errorResponse(400, 'Invalid JSON format');
    }

    await initializeDatabase();
    const branchService = new BranchService();
    const branch = await branchService.updateBranch(clientId, branchId, dto);

    return successResponse(200, {
      id: branch.id,
      clientId: branch.clientId,
      nombre: branch.nombre,
      direccion: branch.direccion,
      region: branch.region,
      comuna: branch.comuna,
      codigoPostal: branch.codigoPostal,
      contactoNombre: branch.contactoNombre,
      contactoTelefono: branch.contactoTelefono,
      contactoEmail: branch.contactoEmail,
      isActive: branch.isActive,
      createdAt: branch.createdAt.toISOString(),
      updatedAt: branch.updatedAt.toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar sucursal';
    console.error('Error en updateBranchHandler:', error);
    
    if (errorMessage.includes('no encontrada')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(updateBranchHandler);

