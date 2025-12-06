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
    const id = event.pathParameters?.id;

    if (!id) {
      return errorResponse(400, 'ID de la sucursal es requerido');
    }

    const branchId = parseInt(id, 10);
    if (isNaN(branchId)) {
      return errorResponse(400, 'ID de la sucursal debe ser un número válido');
    }

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const dto = parseBody<UpdateBranchDto>(event.body!);
    if (!dto) {
      return errorResponse(400, 'Invalid JSON format');
    }

    await initializeDatabase();
    const branchService = new BranchService();
    const branch = await branchService.updateBranch(branchId, dto);

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

