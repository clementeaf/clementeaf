import { DataSource, type DataSourceOptions } from 'typeorm';
import 'reflect-metadata';

/**
 * Configuración de la conexión a la base de datos
 * @returns Configuración de TypeORM
 */
const getDatabaseConfig = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'postgres',
    synchronize: process.env.NODE_ENV === 'development' || process.env.ENABLE_SYNC === 'true',
    logging: process.env.NODE_ENV === 'development',
    entities: [
      'dist/modules/**/*.entity.js',
      'dist/modules/**/entities/*.entity.js'
    ],
    migrations: [
      'dist/migrations/*.js'
    ],
    connectTimeoutMS: 30000,
          ssl: {
            rejectUnauthorized: false
          },
          extra: {
            ssl: {
              rejectUnauthorized: false
            },
            connectionTimeoutMillis: 30000
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

