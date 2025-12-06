import { type APIGatewayProxyEvent } from 'aws-lambda';
import { BranchService } from '../services/BranchService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';

/**
 * Handler para obtener una sucursal por ID
 * @param event - Evento de API Gateway
 * @returns Respuesta con sucursal encontrada
 */
const getBranchByIdHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return errorResponse(400, 'ID de la sucursal es requerido');
    }

    const branchId = parseInt(id, 10);
    if (isNaN(branchId)) {
      return errorResponse(400, 'ID de la sucursal debe ser un número válido');
    }

    await initializeDatabase();
    const branchService = new BranchService();
    const branch = await branchService.getBranchById(branchId);

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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener sucursal';
    console.error('Error en getBranchByIdHandler:', error);
    
    if (errorMessage.includes('no encontrada')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getBranchByIdHandler);

