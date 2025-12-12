import { DataSource, type DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import { allEntities } from './entities';

/**
 * Configuración de la conexión a la base de datos
 * @returns Configuración de TypeORM
 */
const getDatabaseConfig = (): DataSourceOptions => {
  const isProduction = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'postgres',
    synchronize: process.env.NODE_ENV === 'development' || process.env.ENABLE_SYNC === 'true',
    logging: false, // Desactivar logging en producción para mejor rendimiento
    // Usar importación explícita de entidades para que funcione en Lambda
    entities: allEntities,
    migrations: [],
    migrationsRun: false,
    connectTimeoutMS: 10000, // Reducido para fallar rápido si hay problemas de red
    ssl: isProduction ? {
      rejectUnauthorized: false
    } : false,
    extra: {
      // Configuración de pool para Lambda
      max: 2, // Máximo 2 conexiones por instancia de Lambda
      min: 0, // Permitir 0 conexiones cuando no se use
      idleTimeoutMillis: 1000, // Cerrar conexiones inactivas rápido
      connectionTimeoutMillis: 10000
    },
  };
};

export const AppDataSource = new DataSource(getDatabaseConfig());

/**
 * Inicializa la conexión a la base de datos
 * @returns Promise que resuelve cuando la conexión está lista
 */
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return AppDataSource;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    console.error('Database initialization error:', {
      message: errorMessage,
      details: errorDetails,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      isProduction: process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
    });
    
    throw new Error(`Database connection failed: ${errorMessage}`);
  }
};

