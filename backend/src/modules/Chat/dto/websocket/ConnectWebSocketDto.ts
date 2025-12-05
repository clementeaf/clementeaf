/**
 * DTO para conexión WebSocket
 */
export interface ConnectWebSocketDto {
  connectionId: string;
  userId: number;
  token?: string;
}

