import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { validatePermission } from '../../Users/utils/permissions';
import { initializeDatabase } from '../../../config/database';
import { CatalogProductsService, type UpdateCatalogProductInput } from '../services/CatalogProductsService';

/**
 * Handler para actualizar un producto del catálogo WMS.
 * @param event - Evento de API Gateway.
 * @returns Producto actualizado.
 */
const updateCatalogProductHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const permissionError = await validatePermission(event, 'update:products:catalog');
    if (permissionError) return permissionError;

    const idParam = event.pathParameters?.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!idParam || isNaN(id) || id < 1) {
      return errorResponse(400, 'ID de producto inválido');
    }

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const input = parseBody<UpdateCatalogProductInput>(event.body!);
    if (!input) {
      return errorResponse(400, 'Invalid JSON format');
    }

    await initializeDatabase();

    const service = new CatalogProductsService();
    const product = await service.update(id, input);

    return successResponse(200, {
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre,
      descontinuado: product.descontinuado
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar producto';
    console.error('Error en updateCatalogProductHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(updateCatalogProductHandler);


