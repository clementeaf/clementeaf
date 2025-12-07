import dotenv from 'dotenv';
import express, { Express } from 'express';
import logger from './logger.js';
import config from '../config/config.js';
import { WhatsAppService } from './services/WhatsAppService.js';
import { createWhatsAppRoutes } from './routes/whatsapp.routes.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Inicializa y ejecuta la aplicación
 */
async function main(): Promise<void> {
  try {
    logger.info('Iniciando aplicación WhatsApp Baileys...');
    logger.info(`Configuración: ${JSON.stringify(config.baileys)}`);

    // Crear instancia del servicio de WhatsApp
    const whatsappService = new WhatsAppService();

    // Crear servidor Express
    const app: Express = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Rutas de WhatsApp
    app.use('/api/whatsapp', createWhatsAppRoutes(whatsappService));

    // Iniciar servidor
    const port = config.port;
    app.listen(port, () => {
      logger.info(`Servidor Express iniciado en puerto ${port}`);
      logger.info(`API disponible en http://localhost:${port}/api/whatsapp`);
    });

    // Conectar automáticamente al iniciar (opcional)
    const autoConnect = process.env.AUTO_CONNECT === 'true';
    if (autoConnect) {
      logger.info('Auto-conexión habilitada, conectando a WhatsApp...');
      await whatsappService.connect();
    } else {
      logger.info('Auto-conexión deshabilitada. Usa POST /api/whatsapp/connect para conectar');
    }

    // Manejo de señales para desconexión limpia
    process.on('SIGINT', async () => {
      logger.info('Recibida señal SIGINT, desconectando...');
      await whatsappService.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Recibida señal SIGTERM, desconectando...');
      await whatsappService.disconnect();
      process.exit(0);
    });

    logger.info('Aplicación iniciada correctamente');
  } catch (error) {
    logger.error({ error }, 'Error en la aplicación');
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error({ error }, 'Error fatal');
  process.exit(1);
});
