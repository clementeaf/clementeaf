/**
 * DTO para respuestas WebSocket
 */
export interface WebSocketResponseDto {
  success: boolean;
  action?: string;
  data?: unknown;
  error?: string;
  messageId?: number;
}

