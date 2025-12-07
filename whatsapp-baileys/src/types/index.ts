/**
 * Tipos para mensajes de WhatsApp
 */
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
  isMedia: boolean;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
}

/**
 * Respuesta al enviar un mensaje
 */
export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Estado de conexión de WhatsApp
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'authenticating';

/**
 * Información de la sesión
 */
export interface SessionInfo {
  status: ConnectionStatus;
  phoneNumber?: string;
  qrCode?: string;
  isAuthenticated: boolean;
}

