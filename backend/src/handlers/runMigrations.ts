import { type APIGatewayProxyEvent } from 'aws-lambda';
import { AppDataSource } from '../config/database';
import { successResponse, errorResponse } from '../modules/Users/utils/response';

/**
 * Handler para ejecutar migraciones de base de datos
 * @param _event - Evento de API Gateway (no usado)
 * @returns Respuesta con resultado de las migraciones
 */
const runMigrationsHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const migrations = await AppDataSource.runMigrations();

    return successResponse(
      200,
      {
        migrationsRun: migrations.length,
        migrations: migrations.map(m => ({
          name: m.name,
          timestamp: m.timestamp
        }))
      },
      'Migrations executed successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(500, `Migration failed: ${errorMessage}`);
  }
};

export const handler = async (event: APIGatewayProxyEvent) => {
  return await runMigrationsHandler(event);
};

