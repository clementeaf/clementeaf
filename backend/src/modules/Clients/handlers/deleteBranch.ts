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
    await branchService.deleteBranch(branchId);

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

