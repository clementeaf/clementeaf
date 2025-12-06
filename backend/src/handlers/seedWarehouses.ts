import { type APIGatewayProxyEvent } from 'aws-lambda';
import { initializeDatabase } from '../config/database';
import { AppDataSource } from '../config/database';
import { Warehouse } from '../modules/Products/entities/Warehouse.entity';
import { handlerWrapper } from '../modules/Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../modules/Users/utils/response';

/**
 * Handler para ejecutar seed de bodegas
 * @param _event - Evento de API Gateway
 * @returns Respuesta con resultado del seed
 */
const seedWarehousesHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    await initializeDatabase();
    
    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    
    // Bodegas iniciales
    const warehouses = [
      {
        codigo: 'STGO',
        nombre: 'Santiago',
        codigoCorto: 'STGO',
        direccion: 'Santiago, Chile',
        ciudad: 'Santiago',
        activo: true
      },
      {
        codigo: 'VALPO',
        nombre: 'Valparaíso',
        codigoCorto: 'VALPO',
        direccion: 'Valparaíso, Chile',
        ciudad: 'Valparaíso',
        activo: true
      },
      {
        codigo: 'CONCE',
        nombre: 'Concepción',
        codigoCorto: 'CONCE',
        direccion: 'Concepción, Chile',
        ciudad: 'Concepción',
        activo: true
      }
    ];

    const results = {
      created: 0,
      updated: 0,
      total: warehouses.length
    };

    for (const warehouseData of warehouses) {
      const existingWarehouse = await warehouseRepository.findOne({
        where: { codigo: warehouseData.codigo }
      });

      if (existingWarehouse) {
        Object.assign(existingWarehouse, warehouseData);
        await warehouseRepository.save(existingWarehouse);
        results.updated++;
      } else {
        const warehouse = warehouseRepository.create(warehouseData);
        await warehouseRepository.save(warehouse);
        results.created++;
      }
    }
    
    return successResponse(200, {
      message: 'Bodegas creadas/actualizadas exitosamente',
      results
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al ejecutar seed';
    console.error('Error en seedWarehousesHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(seedWarehousesHandler);

