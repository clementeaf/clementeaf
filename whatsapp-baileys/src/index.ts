import dotenv from 'dotenv';
import logger from './logger.js';
import config from '../config/config.js';

// Cargar variables de entorno
dotenv.config();

async function main() {
  logger.info(`Iniciando aplicación en puerto ${config.port}`);
  logger.info(`Configuración de Baileys: ${JSON.stringify(config.baileys)}`);
  
  // Aquí irá la implementación de Baileys
  logger.info('Aplicación iniciada correctamente');
}

main().catch(error => {
  logger.error('Error en la aplicación:', error);
  process.exit(1);
});