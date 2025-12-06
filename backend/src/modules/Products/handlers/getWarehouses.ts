import { type APIGatewayProxyEvent } from 'aws-lambda';
import { WarehouseService } from '../services/WarehouseService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';

/**
 * Handler para obtener todas las bodegas
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de bodegas
 */
const getWarehousesHandler = async (event: APIGatewayProxyEvent) => {
  try {
    await initializeDatabase();

    const warehouseService = new WarehouseService();
    const warehouses = await warehouseService.getAllWarehouses();

    return successResponse(200, {
      data: warehouses.map(warehouse => ({
        id: warehouse.id,
        codigo: warehouse.codigo,
        nombre: warehouse.nombre,
        codigoCorto: warehouse.codigoCorto,
        direccion: warehouse.direccion,
        ciudad: warehouse.ciudad
      })),
      total: warehouses.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener bodegas';
    console.error('Error en getWarehousesHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getWarehousesHandler);

