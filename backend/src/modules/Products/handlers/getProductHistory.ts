import { type APIGatewayProxyEvent } from 'aws-lambda';
import { StockMovementService } from '../services/StockMovementService';
import { MovementType } from '../entities/StockMovement.entity';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';

/**
 * Handler para obtener historial de movimientos de un producto
 * @param event - Evento de API Gateway
 * @returns Respuesta con historial de movimientos
 */
const getProductHistoryHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const productId = event.pathParameters?.productId;
    
    if (!productId) {
      return errorResponse(400, 'ID del producto es requerido');
    }

    await initializeDatabase();

    const queryParams = event.queryStringParameters || {};
    
    const warehouseId = queryParams.warehouseId ? parseInt(queryParams.warehouseId, 10) : undefined;
    const startDate = queryParams.startDate ? new Date(queryParams.startDate) : undefined;
    const endDate = queryParams.endDate ? new Date(queryParams.endDate) : undefined;
    const movementType = queryParams.type as MovementType | undefined;
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 100;
    const offset = queryParams.offset ? parseInt(queryParams.offset, 10) : 0;

    // Validar limit
    if (isNaN(limit) || limit < 1 || limit > 500) {
      return errorResponse(400, 'El parámetro limit debe ser un número entre 1 y 500');
    }

    // Validar offset
    if (isNaN(offset) || offset < 0) {
      return errorResponse(400, 'El parámetro offset debe ser un número mayor o igual a 0');
    }

    // Validar tipo de movimiento
    if (movementType && !Object.values(MovementType).includes(movementType)) {
      return errorResponse(400, `Tipo de movimiento inválido. Valores permitidos: ${Object.values(MovementType).join(', ')}`);
    }

    const stockMovementService = new StockMovementService();
    const history = await stockMovementService.getProductHistory({
      productId,
      warehouseId,
      startDate,
      endDate,
      movementType,
      limit,
      offset
    });

    return successResponse(200, {
      data: history.movements.map(movement => ({
        id: movement.id,
        productId: movement.productId,
        productCode: movement.productCode,
        productName: movement.productName,
        warehouseId: movement.warehouseId,
        type: movement.type,
        cantidad: Number(movement.cantidad),
        stockAnterior: Number(movement.stockAnterior),
        stockNuevo: Number(movement.stockNuevo),
        stockAcumulativo: Number(movement.stockAcumulativo),
        documento: movement.documento,
        numeroDocumento: movement.numeroDocumento,
        fechaDocumento: movement.fechaDocumento?.toISOString().split('T')[0] || null,
        lote: movement.lote,
        observaciones: movement.observaciones,
        createdBy: movement.createdBy,
        createdAt: movement.createdAt.toISOString()
      })),
      total: history.total,
      currentStock: history.currentStock
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener historial';
    console.error('Error en getProductHistoryHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getProductHistoryHandler);

