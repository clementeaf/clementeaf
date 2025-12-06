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

    await initializeDatabase();
    const branchService = new BranchService();
    const branch = await branchService.getBranchById(clientId, branchId);

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

