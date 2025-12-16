import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { validateAnyPermission, getUserWithPermissions } from '../../Users/utils/permissions';
import { initializeDatabase, AppDataSource } from '../../../config/database';
import { StockMovement, MovementType } from '../entities/StockMovement.entity';
import { WarehouseService } from '../services/WarehouseService';
import { ProductsService } from '../services/ProductsService';
import { CatalogProductsService } from '../services/CatalogProductsService';
import { Product as CatalogProductEntity } from '../entities/Product.entity';
import { In, IsNull } from 'typeorm';

/**
 * Request body para el seed de productos top vendidos.
 */
interface SeedTopSoldRequestBody {
  source?: 'sales' | 'zoho' | 'movements' | 'catalog';
  year?: number;
  limit?: number;
  initialStock?: number;
  warehouseId?: number;
  enrichFromZoho?: boolean;
  zohoLookupLimit?: number;
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
    const enrichFromZoho = typeof body.enrichFromZoho === 'boolean' ? body.enrichFromZoho : false;
    const zohoLookupLimit = typeof body.zohoLookupLimit === 'number' ? body.zohoLookupLimit : 20;
    const source: 'sales' | 'zoho' | 'movements' | 'catalog' =
      body.source === 'zoho'
        ? 'zoho'
        : body.source === 'movements'
          ? 'movements'
          : body.source === 'catalog'
            ? 'catalog'
            : 'sales';

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
    let filteredTop: Array<{ productCode: string; productName: string; totalSold: string }> = [];
    let sourceUsed: 'sales' | 'zoho' | 'movements' | 'catalog' = source;

    const physicalMovementTypes: MovementType[] = [
      MovementType.ENTRADA,
      MovementType.AJUSTE,
      MovementType.SALIDA
    ];

    const computeFromMovements = async () => {
      const rows = await movementRepository
        .createQueryBuilder('m')
        .select('m.productCode', 'productCode')
        .addSelect('m.productName', 'productName')
        // Ordenamos por "actividad" (volumen movido), independiente del tipo.
        .addSelect('SUM(ABS(m.cantidad))::decimal', 'totalSold')
        .where('m.type IN (:...types)', { types: physicalMovementTypes })
        .andWhere('m.createdAt >= :startDate AND m.createdAt < :endDate', { startDate, endDate })
        .groupBy('m.productCode')
        .addGroupBy('m.productName')
        .orderBy('SUM(ABS(m.cantidad))', 'DESC')
        .limit(limit)
        .getRawMany<TopSoldRow>();

      return rows
        .map(r => ({
          productCode: (r.productCode || '').trim(),
          productName: (r.productName || '').trim(),
          totalSold: r.totalSold
        }))
        .filter(r => r.productCode.length > 0);
    };

    if (source === 'sales') {
      const topRows = await movementRepository
        .createQueryBuilder('m')
        .select('m.productCode', 'productCode')
        .addSelect('m.productName', 'productName')
        .addSelect('SUM(m.cantidad)', 'totalSold')
        .where('m.type = :type', { type: MovementType.SALIDA })
        .andWhere('m.createdAt >= :startDate AND m.createdAt < :endDate', { startDate, endDate })
        .groupBy('m.productCode')
        .addGroupBy('m.productName')
        .orderBy('SUM(m.cantidad)', 'DESC')
        .limit(limit)
        .getRawMany<TopSoldRow>();

      filteredTop = topRows
        .map(r => ({
          productCode: (r.productCode || '').trim(),
          productName: (r.productName || '').trim(),
          totalSold: r.totalSold
        }))
        .filter(r => r.productCode.length > 0);
      if (filteredTop.length > 0) {
        sourceUsed = 'sales';
      }
    }

    if (source === 'movements') {
      filteredTop = await computeFromMovements();
      if (filteredTop.length > 0) {
        sourceUsed = 'movements';
      }
    }

    if (source === 'catalog') {
      const catalogRepo = AppDataSource.getRepository(CatalogProductEntity);
      // Importante: usar getRawMany() para evitar hydration parcial (si no seleccionamos el PK, TypeORM puede
      // devolver menos filas por identidad interna). Solo necesitamos codigo/nombre.
      const catalog = await catalogRepo
        .createQueryBuilder('p')
        .select('p.codigo', 'codigo')
        .addSelect('p.nombre', 'nombre')
        .where('p.deletedAt IS NULL')
        .orderBy('p.createdAt', 'ASC')
        .take(limit)
        .getRawMany<{ codigo: string; nombre: string }>();

      filteredTop = catalog
        .map(p => ({
          productCode: (p.codigo || '').trim(),
          productName: (p.nombre || '').trim(),
          totalSold: '0'
        }))
        .filter(r => r.productCode.length > 0);

      if (filteredTop.length > 0) {
        sourceUsed = 'catalog';
      }
    }

    // Fallback simple y robusto en AWS:
    // - Si no hay ventas (SALIDA) o Zoho no está accesible desde VPC, usamos movimientos internos.
    if (source === 'zoho') {
      try {
        const externalProductsService = new ProductsService();
        const external = await externalProductsService.listProducts(limit);
        filteredTop = external
          .map(p => ({
            productCode: (p.cod_art_local || '').trim(),
            productName: ((p.name || p.item_name || p.cod_art_local || '') as string).trim(),
            totalSold: '0'
          }))
          .filter(r => r.productCode.length > 0);
        if (filteredTop.length > 0) {
          sourceUsed = 'zoho';
        }
      } catch (err) {
        console.warn('[seedTopSoldCatalogProducts] Zoho no accesible, fallback a movements:', err);
        filteredTop = await computeFromMovements();
        if (filteredTop.length > 0) {
          sourceUsed = 'movements';
        }
      }
    } else if (filteredTop.length === 0 && source !== 'catalog') {
      filteredTop = await computeFromMovements();
      if (filteredTop.length > 0) {
        sourceUsed = 'movements';
      }
    }

    if (filteredTop.length === 0) {
      return successResponse(200, {
        summary: {
          year,
          limitRequested: limit,
          topFound: 0,
          warehouseId,
          initialStock,
          productsUpserted: 0,
          productsFromZoho: 0,
          productsFallback: 0,
          adjustmentsCreated: 0,
          enrichFromZoho,
          zohoLookupLimitApplied: 0,
          sourceUsed
        }
      });
    }

    const catalogService = new CatalogProductsService();

    const externalProductsService = enrichFromZoho ? new ProductsService() : null;
    const lookupCount = enrichFromZoho ? Math.min(Math.max(zohoLookupLimit, 0), filteredTop.length) : 0;
    const rowsWithLookup = filteredTop.slice(0, lookupCount);
    const rowsWithoutLookup = filteredTop.slice(lookupCount);

    /**
     * Optimización anti-timeout (API Gateway limita ~30s):
     * - Inserta productos en bulk (orIgnore) para evitar N queries por fila.
     * - Crea movimientos AJUSTE iniciales en bulk para evitar N lecturas de stock.
     * - Enriquecimiento Zoho opcional y limitado (solo primeros N).
     */
    const productCodes = filteredTop.map(r => r.productCode);
    let productsFromZohoCount = 0;
    let productsFallbackCount = 0;

    if (rowsWithLookup.length > 0) {
      const enriched = await runInBatches(rowsWithLookup, 5, async (row) => {
        const external = externalProductsService ? await externalProductsService.getProductByCode(row.productCode) : null;
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
      productsFromZohoCount = enriched.filter(e => e.source === 'zoho').length;
      productsFallbackCount += enriched.filter(e => e.source === 'fallback').length;
    }

    if (rowsWithoutLookup.length > 0) {
      const values = rowsWithoutLookup.map(row => ({
        codigo: row.productCode,
        nombre: row.productName || row.productCode,
        activo: true,
        descontinuado: false
      }));

      await AppDataSource.createQueryBuilder()
        .insert()
        .into(CatalogProductEntity)
        .values(values)
        .orIgnore()
        .execute();

      productsFallbackCount += rowsWithoutLookup.length;
    }

    const catalogRepo = AppDataSource.getRepository(CatalogProductEntity);
    const catalogProducts = await catalogRepo.find({
      where: {
        codigo: In(productCodes),
        deletedAt: IsNull()
      }
    });
    const nameByCode: Record<string, string> = {};
    for (const p of catalogProducts) {
      nameByCode[p.codigo] = p.nombre;
    }

    const existingPhysicalRows = await movementRepository
      .createQueryBuilder('m')
      .select('DISTINCT m.productId', 'productId')
      .where('m.warehouseId = :warehouseId', { warehouseId })
      .andWhere('m.type IN (:...types)', { types: physicalMovementTypes })
      .andWhere('m.productId IN (:...productIds)', { productIds: productCodes })
      .getRawMany<{ productId: string }>();

    const hasPhysical = new Set(existingPhysicalRows.map(r => String(r.productId)));
    const toAdjustCodes = productCodes.filter(code => !hasPhysical.has(code));

    if (toAdjustCodes.length > 0) {
      const movimientoValues = toAdjustCodes.map(code => ({
        productId: code,
        productCode: code,
        productName: nameByCode[code] || code,
        warehouseId,
        type: MovementType.AJUSTE,
        cantidad: initialStock,
        stockAnterior: 0,
        stockNuevo: initialStock,
        documento: 'SEED',
        numeroDocumento: `SEED-${year}`,
        observaciones: `Stock inicial declarado por seed top vendidos ${year}`,
        createdBy: user.id,
        quoteId: null
      }));

      await movementRepository
        .createQueryBuilder()
        .insert()
        .into(StockMovement)
        .values(movimientoValues)
        .execute();
    }

    const summary = {
      year,
      limitRequested: limit,
      topFound: filteredTop.length,
      warehouseId,
      initialStock,
      productsUpserted: filteredTop.length,
      productsFromZoho: productsFromZohoCount,
      productsFallback: productsFallbackCount,
      adjustmentsCreated: toAdjustCodes.length,
      enrichFromZoho,
      zohoLookupLimitApplied: lookupCount,
      sourceUsed
    };

    return successResponse(200, {
      summary
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en seed top vendidos';
    console.error('Error en seedTopSoldCatalogProductsHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(seedTopSoldCatalogProductsHandler);


