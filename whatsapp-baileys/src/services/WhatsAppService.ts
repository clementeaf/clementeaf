import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../logger.js';
import config from '../../config/config.js';
import { ConnectionStatus, SessionInfo } from '../types/index.js';
import { toDataURL } from 'qrcode';
import P from 'pino';

/**
 * Servicio para manejar la conexión y operaciones de WhatsApp usando Baileys
 */
export class WhatsAppService {
  private socket: WASocket | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private qrCode: string | null = null;
  private phoneNumber: string | null = null;

  /**
   * Inicializa la conexión con WhatsApp
   */
  async connect(): Promise<void> {
    try {
      if (this.socket && this.connectionStatus === 'connected') {
        logger.info('Ya hay una conexión activa');
        return;
      }

      this.connectionStatus = 'connecting';
      logger.info('Iniciando conexión con WhatsApp...');

      const { state, saveCreds } = await useMultiFileAuthState(config.baileys.sessionDir);
      const { version } = await fetchLatestBaileysVersion();

      const socket = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Banados', 'Chrome', '1.0.0'],
        getMessage: async () => {
          return {
            conversation: 'Mensaje no disponible'
          };
        }
      });

      this.socket = socket;

      socket.ev.on('creds.update', saveCreds);
      socket.ev.on('connection.update', (update) => this.handleConnectionUpdate(update));
      socket.ev.on('messages.upsert', (m) => this.handleMessages(m));

      logger.info('Socket de WhatsApp inicializado');
    } catch (error) {
      logger.error({ error }, 'Error al conectar con WhatsApp');
      this.connectionStatus = 'disconnected';
      throw error;
    }
  }

  /**
   * Maneja las actualizaciones de conexión
   */
  private handleConnectionUpdate(update: Partial<ConnectionState>): void {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.connectionStatus = 'authenticating';
      toDataURL(qr).then((url) => {
        this.qrCode = url;
        logger.info('QR Code generado para autenticación');
      }).catch((error: unknown) => {
        logger.error({ error }, 'Error al generar QR Code');
      });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        this.connectionStatus = 'disconnected';
        this.reconnectAttempts++;
        logger.info(`Desconectado. Intentando reconectar... (${this.reconnectAttempts}/${config.baileys.maxReconnectAttempts})`);

        if (this.reconnectAttempts < config.baileys.maxReconnectAttempts) {
        this.reconnectTimer = setTimeout(() => {
          this.connect().catch((error: unknown) => {
            logger.error({ error }, 'Error en reconexión');
          });
        }, config.baileys.reconnectInterval);
        } else {
          logger.error('Número máximo de intentos de reconexión alcanzado');
          this.connectionStatus = 'disconnected';
        }
      } else {
        logger.info('Sesión cerrada. Elimina la carpeta de sesiones para autenticarte de nuevo.');
        this.connectionStatus = 'disconnected';
        this.qrCode = null;
      }
    } else if (connection === 'open') {
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.qrCode = null;
      this.phoneNumber = this.socket?.user?.id?.split(':')[0] || null;
      logger.info('Conectado exitosamente a WhatsApp');
      if (this.phoneNumber) {
        logger.info(`Número de teléfono: ${this.phoneNumber}`);
      }
    }
  }

  /**
   * Maneja los mensajes recibidos
   */
  private handleMessages(m: { messages: proto.IWebMessageInfo[]; type: string }): void {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (!msg.key?.fromMe && msg.message && msg.key) {
        const messageText = msg.message?.conversation || 
                          msg.message?.extendedTextMessage?.text || 
                          'Mensaje no soportado';
        
        const from = msg.key.remoteJid || 'unknown';
        const isGroup = from.includes('@g.us');

        logger.info({ from, messageText }, 'Mensaje recibido');
        
        // Aquí se pueden agregar handlers personalizados para procesar mensajes
        this.onMessageReceived({
          id: msg.key.id || '',
          from,
          body: messageText,
          timestamp: Number(msg.messageTimestamp) * 1000,
          isGroup
        });
      }
    }
  }

  /**
   * Callback para cuando se recibe un mensaje (puede ser sobrescrito)
   */
  protected onMessageReceived(message: {
    id: string;
    from: string;
    body: string;
    timestamp: number;
    isGroup: boolean;
  }): void {
    // Implementación por defecto - puede ser extendida
    logger.debug({ message }, 'Mensaje recibido');
  }

  /**
   * Envía un mensaje de texto
   */
  async sendMessage(to: string, message: string): Promise<string> {
    if (!this.socket || this.connectionStatus !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }

    try {
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      const result = await this.socket.sendMessage(jid, { text: message });
      
      if (result?.key?.id) {
        logger.info({ jid, messageId: result.key.id }, 'Mensaje enviado');
        return result.key.id;
      }
      return '';
    } catch (error) {
      logger.error({ error, jid: to }, 'Error al enviar mensaje');
      throw error;
    }
  }

  /**
   * Envía un mensaje con imagen
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<string> {
    if (!this.socket || this.connectionStatus !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }

    try {
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      const result = await this.socket.sendMessage(jid, {
        image: { url: imageUrl },
        caption: caption || ''
      });
      
      if (result?.key?.id) {
        logger.info({ jid, messageId: result.key.id }, 'Imagen enviada');
        return result.key.id;
      }
      return '';
    } catch (error) {
      logger.error({ error, jid: to }, 'Error al enviar imagen');
      throw error;
    }
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getStatus(): SessionInfo {
    return {
      status: this.connectionStatus,
      phoneNumber: this.phoneNumber || undefined,
      qrCode: this.qrCode || undefined,
      isAuthenticated: this.connectionStatus === 'connected'
    };
  }

  /**
   * Desconecta la sesión
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      await this.socket.end(undefined);
      this.socket = null;
    }

    this.connectionStatus = 'disconnected';
    this.qrCode = null;
    this.phoneNumber = null;
    logger.info('Desconectado de WhatsApp');
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }
}

