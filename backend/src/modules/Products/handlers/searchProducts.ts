import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ProductsService } from '../services/ProductsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para buscar productos
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de productos encontrados
 */
const searchProductsHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const queryParams = event.queryStringParameters || {};

    const searchTerm = queryParams.search || queryParams.searchTerm || '';
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;

    if (isNaN(limit) || limit < 1 || limit > 200) {
      return errorResponse(400, 'El parámetro limit debe ser un número entre 1 y 200');
    }

    const productsService = new ProductsService();
    const products = await productsService.searchProducts({ searchTerm, limit });

    return successResponse(200, {
      data: products.map(product => ({
        id: product.ID,
        codigo: product.cod_art_local,
        nombre: product.name || product.item_name,
        sku: product.sku,
        precio: product.rate,
        stock: product.stock_on_hand || product.available_stock || 0,
        categoria: product.category_name,
        marca: product.brand,
        fabricante: product.manufacturer,
        unidad: product.unit,
        descripcion: product.description,
        estado: product.status,
        itemId: product.item_id,
        categoryId: product.category_id,
        purchaseRate: product.purchase_rate,
        taxPercentage: product.tax_percentage
      })),
      total: products.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al buscar productos';
    console.error('Error en searchProductsHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(searchProductsHandler);

