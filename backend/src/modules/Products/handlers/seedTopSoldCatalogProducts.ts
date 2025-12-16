import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { validateAnyPermission, getUserWithPermissions } from '../../Users/utils/permissions';
import { initializeDatabase, AppDataSource } from '../../../config/database';
import { StockMovementService } from '../services/StockMovementService';
import { StockMovement, MovementType } from '../entities/StockMovement.entity';
import { WarehouseService } from '../services/WarehouseService';
import { ProductsService } from '../services/ProductsService';
import { CatalogProductsService } from '../services/CatalogProductsService';
import type { Product } from '../entities/Product.entity';
import { In } from 'typeorm';

/**
 * Request body para el seed de productos top vendidos.
 */
interface SeedTopSoldRequestBody {
  year?: number;
  limit?: number;
  initialStock?: number;
  warehouseId?: number;
}

/**
 * Resultado raw de top vendidos.
 */
interface TopSoldRow {
  productCode: string;
  productName: string;
  totalSold: string;
}

/**
 * Ejecuta tareas asincrónicas en lotes para controlar concurrencia.
 * @param items - Items a procesar.
 * @param batchSize - Tamaño del lote.
 * @param worker - Función de trabajo.
 * @returns Resultados en el mismo orden.
 */
const runInBatches = async <TItem, TResult>(
  items: TItem[],
  batchSize: number,
  worker: (item: TItem) => Promise<TResult>
): Promise<TResult[]> => {
  const results: TResult[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }
  return results;
};

/**
 * Handler para poblar el catálogo con los top vendidos del año, basándose en SALIDAS.
 * Además declara stock inicial (AJUSTE) para productos sin movimientos físicos previos en la bodega.
 * @param event - Evento de API Gateway.
 * @returns Resumen de productos creados/actualizados y ajustes creados.
 */
const seedTopSoldCatalogProductsHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const permissionError = await validateAnyPermission(event, ['seed:products:catalog', 'create:products:movements']);
    if (permissionError) return permissionError;

    const user = await getUserWithPermissions(event);
    if (!user) {
      return errorResponse(401, 'No autenticado');
    }

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const body = parseBody<SeedTopSoldRequestBody>(event.body!);
    if (!body) {
      return errorResponse(400, 'Invalid JSON format');
    }

    const year = typeof body.year === 'number' ? body.year : 2025;
    const limit = typeof body.limit === 'number' ? body.limit : 200;
    const initialStock = typeof body.initialStock === 'number' ? body.initialStock : 100;
    const warehouseId = typeof body.warehouseId === 'number' ? body.warehouseId : 1;

    if (year < 2000 || year > 2100) {
      return errorResponse(400, 'year inválido');
    }
    if (limit < 1 || limit > 500) {
      return errorResponse(400, 'limit debe ser entre 1 y 500');
    }
    if (initialStock <= 0 || initialStock > 1000000) {
      return errorResponse(400, 'initialStock inválido');
    }

    await initializeDatabase();

    const warehouseService = new WarehouseService();
    const warehouse = await warehouseService.getWarehouseById(warehouseId);
    if (!warehouse) {
      return errorResponse(400, `Bodega ${warehouseId} no existe o no está activa`);
    }

    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

    const movementRepository = AppDataSource.getRepository(StockMovement);
    const topRows = await movementRepository
      .createQueryBuilder('m')
      .select('m.productCode', 'productCode')
      .addSelect('m.productName', 'productName')
      .addSelect('SUM(m.cantidad)', 'totalSold')
      .where('m.type = :type', { type: MovementType.SALIDA })
      .andWhere('m.createdAt >= :startDate AND m.createdAt < :endDate', { startDate, endDate })
      .groupBy('m.productCode')
      .addGroupBy('m.productName')
      .orderBy('totalSold', 'DESC')
      .limit(limit)
      .getRawMany<TopSoldRow>();

    const filteredTop = topRows
      .map(r => ({
        productCode: (r.productCode || '').trim(),
        productName: (r.productName || '').trim(),
        totalSold: r.totalSold
      }))
      .filter(r => r.productCode.length > 0);

    const externalProductsService = new ProductsService();
    const catalogService = new CatalogProductsService();
    const stockService = new StockMovementService();

    const upsertedProducts = await runInBatches(filteredTop, 5, async (row) => {
      const external = await externalProductsService.getProductByCode(row.productCode);
      if (external) {
        const product = await catalogService.upsertFromExternal(external);
        return { product, source: 'zoho' as const };
      }

      const product = await catalogService.create({
        codigo: row.productCode,
        nombre: row.productName || row.productCode,
        sku: null,
        activo: true,
        descontinuado: false
      });
      return { product, source: 'fallback' as const };
    });

    const physicalMovementTypes: MovementType[] = [
      MovementType.ENTRADA,
      MovementType.AJUSTE,
      MovementType.SALIDA
    ];

    const createdAdjustments: Array<{ codigo: string; movementId: number; stockNuevo: number }> = [];
    for (const item of upsertedProducts) {
      const product: Product = item.product;

      // Si ya hay movimientos físicos para este producto en esa bodega, no declaramos stock inicial.
      const existingPhysicalMovement = await movementRepository.findOne({
        where: {
          productId: product.codigo,
          warehouseId,
          type: In(physicalMovementTypes)
        },
        order: { createdAt: 'DESC' }
      });

      if (existingPhysicalMovement) {
        continue;
      }

      const movement = await stockService.createMovement({
        productId: product.codigo,
        productCode: product.codigo,
        productName: product.nombre,
        warehouseId,
        type: MovementType.AJUSTE,
        cantidad: initialStock,
        documento: 'SEED',
        numeroDocumento: `SEED-${year}`,
        observaciones: `Stock inicial declarado por seed top vendidos ${year}`,
        createdBy: user.id
      });

      createdAdjustments.push({
        codigo: product.codigo,
        movementId: movement.id,
        stockNuevo: Number(movement.stockNuevo)
      });
    }

    const summary = {
      year,
      limitRequested: limit,
      topFound: filteredTop.length,
      warehouseId,
      initialStock,
      productsUpserted: upsertedProducts.length,
      productsFromZoho: upsertedProducts.filter(p => p.source === 'zoho').length,
      productsFallback: upsertedProducts.filter(p => p.source === 'fallback').length,
      adjustmentsCreated: createdAdjustments.length
    };

    return successResponse(200, {
      summary,
      createdAdjustments
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en seed top vendidos';
    console.error('Error en seedTopSoldCatalogProductsHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(seedTopSoldCatalogProductsHandler);


