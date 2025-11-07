import { DataSource, type DataSourceOptions } from 'typeorm';
import 'reflect-metadata';

/**
 * Configuración de la conexión a la base de datos
 * @returns Configuración de TypeORM
 */
const getDatabaseConfig = (): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'banados_db',
    synchronize: process.env.NODE_ENV === 'development' || process.env.ENABLE_SYNC === 'true',
    logging: process.env.NODE_ENV === 'development',
    entities: [
      'dist/modules/**/*.entity.js',
      'dist/modules/**/entities/*.entity.js'
    ],
    migrations: [
      'dist/migrations/*.js'
    ],
    ssl: isProduction ? {
      rejectUnauthorized: false
    } : false,
    extra: isProduction ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : undefined,
  };
};

export const AppDataSource = new DataSource(getDatabaseConfig());

/**
 * Inicializa la conexión a la base de datos
 * @returns Promise que resuelve cuando la conexión está lista
 */
export const initializeDatabase = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

