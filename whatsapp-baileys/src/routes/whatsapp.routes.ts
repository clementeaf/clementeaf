import { Router, Request, Response } from 'express';
import { WhatsAppService } from '../services/WhatsAppService.js';
import logger from '../logger.js';
import { SendMessageResponse } from '../types/index.js';

/**
 * Crea las rutas de la API REST para WhatsApp
 */
export function createWhatsAppRoutes(whatsappService: WhatsAppService): Router {
  const router = Router();

  /**
   * GET /status
   * Obtiene el estado actual de la conexión
   */
  router.get('/status', (_req: Request, res: Response) => {
    try {
      const status = whatsappService.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener estado');
      res.status(500).json({
        success: false,
        error: 'Error al obtener estado de la conexión'
      });
    }
  });

  /**
   * POST /connect
   * Inicia la conexión con WhatsApp
   */
  router.post('/connect', async (_req: Request, res: Response) => {
    try {
      await whatsappService.connect();
      res.json({
        success: true,
        message: 'Conexión iniciada'
      });
    } catch (error) {
      logger.error({ error }, 'Error al conectar');
      res.status(500).json({
        success: false,
        error: 'Error al iniciar conexión'
      });
    }
  });

  /**
   * POST /disconnect
   * Desconecta la sesión de WhatsApp
   */
  router.post('/disconnect', async (_req: Request, res: Response) => {
    try {
      await whatsappService.disconnect();
      res.json({
        success: true,
        message: 'Desconectado exitosamente'
      });
    } catch (error) {
      logger.error({ error }, 'Error al desconectar');
      res.status(500).json({
        success: false,
        error: 'Error al desconectar'
      });
    }
  });

  /**
   * POST /send-message
   * Envía un mensaje de texto
   * Body: { to: string, message: string }
   */
  router.post('/send-message', async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        res.status(400).json({
          success: false,
          error: 'Los campos "to" y "message" son requeridos'
        });
        return;
      }

      if (!whatsappService.isConnected()) {
        res.status(503).json({
          success: false,
          error: 'WhatsApp no está conectado'
        });
        return;
      }

      const messageId = await whatsappService.sendMessage(to, message);
      const response: SendMessageResponse = {
        success: true,
        messageId
      };

      res.json(response);
    } catch (error) {
      logger.error({ error }, 'Error al enviar mensaje');
      const response: SendMessageResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Error al enviar mensaje'
      };
      res.status(500).json(response);
    }
  });

  /**
   * POST /send-image
   * Envía un mensaje con imagen
   * Body: { to: string, imageUrl: string, caption?: string }
   */
  router.post('/send-image', async (req: Request, res: Response) => {
    try {
      const { to, imageUrl, caption } = req.body;

      if (!to || !imageUrl) {
        res.status(400).json({
          success: false,
          error: 'Los campos "to" e "imageUrl" son requeridos'
        });
        return;
      }

      if (!whatsappService.isConnected()) {
        res.status(503).json({
          success: false,
          error: 'WhatsApp no está conectado'
        });
        return;
      }

      const messageId = await whatsappService.sendImage(to, imageUrl, caption);
      const response: SendMessageResponse = {
        success: true,
        messageId
      };

      res.json(response);
    } catch (error) {
      logger.error({ error }, 'Error al enviar imagen');
      const response: SendMessageResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Error al enviar imagen'
      };
      res.status(500).json(response);
    }
  });

  return router;
}

