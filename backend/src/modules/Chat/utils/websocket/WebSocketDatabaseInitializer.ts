import { AppDataSource } from '../../../../config/database';

/**
 * Utilidad para asegurar que la base de datos esté inicializada antes de operaciones WebSocket
 * @returns Promise que resuelve cuando la BD está lista
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('✅ Base de datos inicializada para WebSocket');
    } catch (error) {
      console.error('❌ Error inicializando base de datos para WebSocket:', error);
      throw error;
    }
  }
}

