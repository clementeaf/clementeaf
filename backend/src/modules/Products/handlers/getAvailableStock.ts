import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase, AppDataSource } from '../../../config/database';
import { StockMovement, MovementType } from '../entities/StockMovement.entity';

/**
 * Handler para obtener stock disponible (físico - reservado)
 */
const getAvailableStockHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const productId = event.pathParameters?.productId;
    const warehouseIdParam = event.queryStringParameters?.warehouseId;

    if (!productId) {
      return errorResponse(400, 'Product ID requerido');
    }

    await initializeDatabase();

    const movementRepository = AppDataSource.getRepository(StockMovement);

    // Construir query base
    let queryBuilder = movementRepository
      .createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });

    // Filtrar por bodega si se especifica
    if (warehouseIdParam) {
      const warehouseId = parseInt(warehouseIdParam);
      queryBuilder = queryBuilder.andWhere('movement.warehouseId = :warehouseId', { warehouseId });
    }

    // Obtener todos los movimientos
    const movements = await queryBuilder
      .orderBy('movement.createdAt', 'ASC')
      .getMany();

    if (movements.length === 0) {
      return successResponse(200, {
        productId,
        warehouseId: warehouseIdParam ? parseInt(warehouseIdParam) : null,
        stockFisico: 0,
        stockReservado: 0,
        stockDisponible: 0
      });
    }

    // Calcular stock físico (último stockNuevo de movimientos no-RESERVA)
    const movimientosFisicos = movements.filter(m => m.type !== MovementType.RESERVA);
    const stockFisico = movimientosFisicos.length > 0
      ? Number(movimientosFisicos[movimientosFisicos.length - 1].stockNuevo)
      : 0;

    // Calcular stock reservado (sumar todas las RESERVA activas)
    const reservas = movements.filter(m => m.type === MovementType.RESERVA);
    const stockReservado = reservas.reduce((acc, r) => acc + Number(r.cantidad), 0);

    // Stock disponible = Stock físico - Stock reservado
    const stockDisponible = stockFisico - stockReservado;

    console.log(`📊 Stock para producto ${productId}: Físico=${stockFisico}, Reservado=${stockReservado}, Disponible=${stockDisponible}`);

    return successResponse(200, {
      productId,
      warehouseId: warehouseIdParam ? parseInt(warehouseIdParam) : null,
      stockFisico,
      stockReservado,
      stockDisponible,
      detalleReservas: reservas.map(r => ({
        id: r.id,
        cantidad: Number(r.cantidad),
        quoteId: r.quoteId,
        numeroDocumento: r.numeroDocumento,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido obteniendo stock disponible';
    console.error('Error en getAvailableStockHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getAvailableStockHandler);
