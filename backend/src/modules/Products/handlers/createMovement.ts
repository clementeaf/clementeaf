import { type APIGatewayProxyEvent } from 'aws-lambda';
import { StockMovementService } from '../services/StockMovementService';
import { MovementType } from '../entities/StockMovement.entity';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import type { CreateMovementDto } from '../dto/CreateMovementDto';

/**
 * Handler para crear un movimiento de stock
 * @param event - Evento de API Gateway
 * @returns Respuesta con movimiento creado
 */
const createMovementHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const dto = parseBody<CreateMovementDto>(event.body!);
    if (!dto) {
      return errorResponse(400, 'Invalid JSON format');
    }

    // Validaciones
    if (!dto.productId || !dto.productCode || !dto.productName) {
      return errorResponse(400, 'productId, productCode y productName son requeridos');
    }

    if (!dto.warehouseId || isNaN(dto.warehouseId)) {
      return errorResponse(400, 'warehouseId debe ser un número válido');
    }

    if (!dto.type || !Object.values(MovementType).includes(dto.type)) {
      return errorResponse(400, `type debe ser uno de: ${Object.values(MovementType).join(', ')}`);
    }

    if (!dto.cantidad || isNaN(Number(dto.cantidad)) || Number(dto.cantidad) <= 0) {
      return errorResponse(400, 'cantidad debe ser un número mayor a 0');
    }

    await initializeDatabase();

    const stockMovementService = new StockMovementService();
    
    // Convertir fechaDocumento de string a Date si existe
    const fechaDocumento = dto.fechaDocumento ? new Date(dto.fechaDocumento) : undefined;

    const movement = await stockMovementService.createMovement({
      productId: dto.productId,
      productCode: dto.productCode,
      productName: dto.productName,
      warehouseId: dto.warehouseId,
      type: dto.type,
      cantidad: Number(dto.cantidad),
      documento: dto.documento,
      numeroDocumento: dto.numeroDocumento,
      fechaDocumento,
      lote: dto.lote,
      observaciones: dto.observaciones,
      createdBy: dto.createdBy
    });

    return successResponse(201, {
      id: movement.id,
      productId: movement.productId,
      productCode: movement.productCode,
      productName: movement.productName,
      warehouseId: movement.warehouseId,
      type: movement.type,
      cantidad: Number(movement.cantidad),
      stockAnterior: Number(movement.stockAnterior),
      stockNuevo: Number(movement.stockNuevo),
      documento: movement.documento,
      numeroDocumento: movement.numeroDocumento,
      fechaDocumento: movement.fechaDocumento?.toISOString().split('T')[0] || null,
      lote: movement.lote,
      observaciones: movement.observaciones,
      createdAt: movement.createdAt.toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear movimiento';
    console.error('Error en createMovementHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(createMovementHandler);

