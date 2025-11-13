import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ProductService } from '../services/ProductService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
// Importar la entidad para que TypeORM la registre
import '../entities/Product.entity';

/**
 * Handler para buscar productos por nombre o código
 */
const searchProductsHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const searchTerm = queryParams.q || queryParams.search || '';
  const limit = queryParams.limit ? parseInt(queryParams.limit) : 20;

  if (!searchTerm || searchTerm.trim() === '') {
    return successResponse(200, { data: [], total: 0 });
  }

  const productService = new ProductService();
  const result = await productService.searchProducts(searchTerm.trim(), limit);

  return successResponse(200, { data: result, total: result.length });
};

export const handler = handlerWrapper(searchProductsHandler);

