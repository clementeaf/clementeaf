import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ProductService } from '../services/ProductService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
// Importar la entidad para que TypeORM la registre
import '../entities/Product.entity';

/**
 * Handler para obtener todos los productos con filtros y paginación
 */
const getAllProductsHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const filters = {
    codigo: queryParams.codigo,
    nombre: queryParams.nombre,
    clase1: queryParams.clase1,
    eliminado: queryParams.eliminado,
    obsoleto: queryParams.obsoleto,
    publicado: queryParams.publicado ? parseInt(queryParams.publicado) : undefined,
    producto_web: queryParams.producto_web ? parseInt(queryParams.producto_web) : undefined,
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
  };

  const productService = new ProductService();
  const result = await productService.getAllProducts(filters);

  return successResponse(200, result);
};

export const handler = handlerWrapper(getAllProductsHandler);

