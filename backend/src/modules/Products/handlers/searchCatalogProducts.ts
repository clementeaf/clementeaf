import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validateAnyPermission } from '../../Users/utils/permissions';
import { initializeDatabase } from '../../../config/database';
import { CatalogProductsService } from '../services/CatalogProductsService';
import { StockMovementService } from '../services/StockMovementService';

/**
 * Handler para buscar productos del catálogo WMS.
 * @param event - Evento de API Gateway.
 * @returns Respuesta con lista de productos del catálogo.
 */
const searchCatalogProductsHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const permissionError = await validateAnyPermission(event, ['view:products:search', 'view:products:catalog']);
    if (permissionError) return permissionError;

    const queryParams = event.queryStringParameters || {};
    const searchTerm = (queryParams.search || queryParams.searchTerm || '').toString();
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;
    const includeDiscontinued = queryParams.includeDiscontinued !== 'false';
    const warehouseIdParam = queryParams.warehouseId;
    const warehouseId = warehouseIdParam ? parseInt(warehouseIdParam, 10) : null;

    if (isNaN(limit) || limit < 1 || limit > 200) {
      return errorResponse(400, 'El parámetro limit debe ser un número entre 1 y 200');
    }
    if (warehouseIdParam && (warehouseId === null || isNaN(warehouseId) || warehouseId < 1)) {
      return errorResponse(400, 'warehouseId inválido');
    }

    await initializeDatabase();

    const service = new CatalogProductsService();
    const products = await service.search({
      searchTerm,
      limit,
      includeDiscontinued,
      includeDeleted: false
    });

    const stockService = new StockMovementService();
    const stocksByCodigo: Record<string, number> = {};
    if (warehouseId) {
      for (const p of products) {
        stocksByCodigo[p.codigo] = await stockService.getCurrentStock(p.codigo, warehouseId);
      }
    }

    return successResponse(200, {
      data: products.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        sku: p.sku,
        precio: p.rate,
        stock: warehouseId ? (stocksByCodigo[p.codigo] ?? 0) : 0,
        categoria: p.categoryName,
        marca: p.brand,
        fabricante: p.manufacturer,
        unidad: p.unit,
        descripcion: p.description,
        estado: p.status,
        itemId: p.itemId,
        categoryId: p.categoryId,
        purchaseRate: p.purchaseRate,
        taxPercentage: p.taxPercentage,
        descontinuado: p.descontinuado
      })),
      total: products.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al buscar productos del catálogo';
    console.error('Error en searchCatalogProductsHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(searchCatalogProductsHandler);


