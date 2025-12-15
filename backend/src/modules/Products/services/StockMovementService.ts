import { AppDataSource } from '../../../config/database';
import { StockMovement, MovementType } from '../entities/StockMovement.entity';
import { Repository } from 'typeorm';

/**
 * Opciones para obtener historial de movimientos
 */
export interface GetHistoryOptions {
  productId: string;
  warehouseId?: number;
  startDate?: Date;
  endDate?: Date;
  movementType?: MovementType;
  limit?: number;
  offset?: number;
}

/**
 * Resultado del historial con stock acumulativo
 */
export interface MovementHistoryItem extends StockMovement {
  stockAcumulativo: number;
}

/**
 * Respuesta del historial
 */
export interface MovementHistoryResponse {
  movements: MovementHistoryItem[];
  total: number;
  currentStock: number;
}

/**
 * DTO para crear un movimiento
 */
export interface CreateMovementDto {
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: number;
  type: MovementType;
  cantidad: number;
  documento?: string;
  numeroDocumento?: string;
  fechaDocumento?: Date;
  lote?: string;
  observaciones?: string;
  createdBy?: number;
  quoteId?: number;
}

/**
 * Servicio para gestionar movimientos de stock
 */
export class StockMovementService {
  private get movementRepository(): Repository<StockMovement> {
    return AppDataSource.getRepository(StockMovement);
  }

  /**
   * Obtiene el historial de movimientos de un producto
   * @param options - Opciones de búsqueda
   * @returns Historial con stock acumulativo
   */
  async getProductHistory(options: GetHistoryOptions): Promise<MovementHistoryResponse> {
    const {
      productId,
      warehouseId,
      startDate,
      endDate,
      movementType,
      limit = 100,
      offset = 0
    } = options;

    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });

    // Filtro por bodega
    if (warehouseId) {
      queryBuilder.andWhere('movement.warehouseId = :warehouseId', { warehouseId });
    }

    // Filtro por fecha
    if (startDate) {
      queryBuilder.andWhere('movement.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('movement.createdAt <= :endDate', { endDate });
    }

    // Filtro por tipo de movimiento
    if (movementType) {
      queryBuilder.andWhere('movement.type = :movementType', { movementType });
    }

    // Ordenar por fecha descendente (más recientes primero)
    queryBuilder.orderBy('movement.createdAt', 'DESC');

    // Paginación
    queryBuilder.take(limit);
    queryBuilder.skip(offset);

    const [movements, total] = await queryBuilder.getManyAndCount();

    // Calcular stock acumulativo
    // Necesitamos ordenar por fecha ascendente para calcular correctamente
    const movementsOrdered = [...movements].reverse(); // Revertir para calcular desde el más antiguo

    let stockAcumulativo = 0;
    const movementsWithStock: MovementHistoryItem[] = movementsOrdered.map(movement => {
      // El stock acumulativo es el stockNuevo de cada movimiento
      stockAcumulativo = Number(movement.stockNuevo);
      return {
        ...movement,
        stockAcumulativo
      };
    });

    // Revertir de nuevo para mostrar más recientes primero
    movementsWithStock.reverse();

    // Stock actual es el del movimiento más reciente (o 0 si no hay movimientos)
    const currentStock = movementsWithStock.length > 0 
      ? Number(movementsWithStock[0].stockNuevo)
      : 0;

    return {
      movements: movementsWithStock,
      total,
      currentStock
    };
  }

  /**
   * Obtiene el stock actual de un producto en una bodega
   * @param productId - ID del producto
   * @param warehouseId - ID de la bodega
   * @returns Stock actual o 0 si no hay movimientos
   */
  async getCurrentStock(productId: string, warehouseId: number): Promise<number> {
    const lastMovement = await this.movementRepository.findOne({
      where: {
        productId,
        warehouseId
      },
      order: {
        createdAt: 'DESC'
      }
    });

    return lastMovement ? Number(lastMovement.stockNuevo) : 0;
  }

  /**
   * Crea un nuevo movimiento de stock
   * @param dto - Datos del movimiento
   * @returns Movimiento creado
   * @throws Error si no hay stock suficiente para salidas
   */
  async createMovement(dto: CreateMovementDto): Promise<StockMovement> {
    // Obtener stock actual
    const stockAnterior = await this.getCurrentStock(dto.productId, dto.warehouseId);

    // Validar stock disponible para salidas
    if (dto.type === MovementType.SALIDA) {
      const cantidad = Number(dto.cantidad);
      if (cantidad > stockAnterior) {
        throw new Error(`Stock insuficiente. Stock disponible: ${stockAnterior.toLocaleString('es-CL')}, cantidad solicitada: ${cantidad.toLocaleString('es-CL')}`);
      }
    }

    // Calcular nuevo stock según el tipo de movimiento
    let stockNuevo: number;
    if (dto.type === MovementType.ENTRADA || dto.type === MovementType.AJUSTE) {
      stockNuevo = stockAnterior + Number(dto.cantidad);
    } else if (dto.type === MovementType.SALIDA) {
      stockNuevo = stockAnterior - Number(dto.cantidad); // Ya validamos que hay stock suficiente
    } else if (dto.type === MovementType.RESERVA) {
      stockNuevo = stockAnterior; // Las reservas no modifican el stock físico
    } else {
      // TRANSFERENCIA: se manejará en Fase 4
      stockNuevo = stockAnterior;
    }

    // Crear el movimiento
    const movement = this.movementRepository.create({
      productId: dto.productId,
      productCode: dto.productCode,
      productName: dto.productName,
      warehouseId: dto.warehouseId,
      type: dto.type,
      cantidad: dto.cantidad,
      stockAnterior,
      stockNuevo,
      documento: dto.documento || null,
      numeroDocumento: dto.numeroDocumento || null,
      fechaDocumento: dto.fechaDocumento || null,
      lote: dto.lote || null,
      observaciones: dto.observaciones || null,
      createdBy: dto.createdBy || null,
      quoteId: dto.quoteId || null
    });

    return await this.movementRepository.save(movement);
  }

  /**
   * Obtiene estadísticas de movimientos
   * @param productId - ID del producto
   * @param warehouseId - ID de la bodega (opcional)
   * @returns Estadísticas
   */
  async getMovementStats(productId: string, warehouseId?: number): Promise<{
    totalMovements: number;
    totalEntradas: number;
    totalSalidas: number;
    currentStock: number;
  }> {
    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });

    if (warehouseId) {
      queryBuilder.andWhere('movement.warehouseId = :warehouseId', { warehouseId });
    }

    const movements = await queryBuilder.getMany();

    const totalMovements = movements.length;
    const totalEntradas = movements
      .filter(m => m.type === MovementType.ENTRADA)
      .reduce((sum, m) => sum + Number(m.cantidad), 0);
    const totalSalidas = movements
      .filter(m => m.type === MovementType.SALIDA)
      .reduce((sum, m) => sum + Number(m.cantidad), 0);

    const currentStock = movements.length > 0
      ? Number(movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].stockNuevo)
      : 0;

    return {
      totalMovements,
      totalEntradas,
      totalSalidas,
      currentStock
    };
  }
}

