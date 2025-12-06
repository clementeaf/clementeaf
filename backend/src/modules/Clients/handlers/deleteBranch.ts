import { type APIGatewayProxyEvent } from 'aws-lambda';
import { BranchService } from '../services/BranchService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';

/**
 * Handler para eliminar una sucursal (soft delete)
 * @param event - Evento de API Gateway
 * @returns Respuesta de éxito
 */
const deleteBranchHandler = async (event: APIGatewayProxyEvent) => {
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
    await branchService.deleteBranch(clientId, branchId);

    return successResponse(200, { message: 'Sucursal eliminada exitosamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar sucursal';
    console.error('Error en deleteBranchHandler:', error);
    
    if (errorMessage.includes('no encontrada')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(deleteBranchHandler);

