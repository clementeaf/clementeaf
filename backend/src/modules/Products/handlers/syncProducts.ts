import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ProductSyncService } from '../services/ProductSyncService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
// Importar la entidad para que TypeORM la registre
import '../entities/Product.entity';

/**
 * Handler para sincronizar productos desde la API externa a la base de datos
 */
const syncProductsHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const productSyncService = new ProductSyncService();
    const result = await productSyncService.syncProducts();

    return successResponse(200, result, 'Products synchronized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(500, `Error syncing products: ${errorMessage}`);
  }
};

export const handler = handlerWrapper(syncProductsHandler);

