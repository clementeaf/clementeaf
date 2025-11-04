import { initializeDatabase } from './database';

/**
 * Inicializa todas las configuraciones de la aplicación
 * @returns Promise que resuelve cuando todo está inicializado
 */
export const initializeConfig = async (): Promise<void> => {
  await initializeDatabase();
};

