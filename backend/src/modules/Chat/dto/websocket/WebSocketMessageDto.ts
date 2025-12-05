/**
 * DTO para mensajes recibidos vía WebSocket
 */
export interface WebSocketMessageDto {
  action: string;
  conversationId?: string;
  content?: string;
  messageId?: string;
  userId?: number;
}

/**
 * Tipos de acciones soportadas en WebSocket
 */
export enum WebSocketAction {
  SEND_MESSAGE = 'send_message',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  MARK_AS_READ = 'mark_as_read',
  PING = 'ping',
  PONG = 'pong'
}

