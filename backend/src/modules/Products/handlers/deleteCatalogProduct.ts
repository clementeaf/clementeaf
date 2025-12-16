import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validatePermission } from '../../Users/utils/permissions';
import { initializeDatabase } from '../../../config/database';
import { CatalogProductsService } from '../services/CatalogProductsService';

/**
 * Handler para eliminar (soft delete) un producto del catálogo WMS.
 * @param event - Evento de API Gateway.
 * @returns Confirmación de eliminación.
 */
const deleteCatalogProductHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const permissionError = await validatePermission(event, 'delete:products:catalog');
    if (permissionError) return permissionError;

    const idParam = event.pathParameters?.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!idParam || isNaN(id) || id < 1) {
      return errorResponse(400, 'ID de producto inválido');
    }

    await initializeDatabase();

    const service = new CatalogProductsService();
    const product = await service.softDelete(id);

    return successResponse(200, {
      id: product.id,
      codigo: product.codigo,
      deletedAt: product.deletedAt?.toISOString() ?? null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar producto';
    console.error('Error en deleteCatalogProductHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(deleteCatalogProductHandler);


