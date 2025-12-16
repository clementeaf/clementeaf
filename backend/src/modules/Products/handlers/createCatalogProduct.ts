import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { validatePermission } from '../../Users/utils/permissions';
import { initializeDatabase } from '../../../config/database';
import { CatalogProductsService, type CreateCatalogProductInput } from '../services/CatalogProductsService';

/**
 * Handler para crear un producto en el catálogo WMS.
 * @param event - Evento de API Gateway.
 * @returns Producto creado.
 */
const createCatalogProductHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const permissionError = await validatePermission(event, 'create:products:catalog');
    if (permissionError) return permissionError;

    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const input = parseBody<CreateCatalogProductInput>(event.body!);
    if (!input) {
      return errorResponse(400, 'Invalid JSON format');
    }

    await initializeDatabase();

    const service = new CatalogProductsService();
    const product = await service.create(input);

    return successResponse(201, {
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear producto';
    console.error('Error en createCatalogProductHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(createCatalogProductHandler);


