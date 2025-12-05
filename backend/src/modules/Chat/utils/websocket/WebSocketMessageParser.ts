import { type APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { WebSocketMessageDto, WebSocketAction } from '../../dto/websocket/WebSocketMessageDto';

/**
 * Servicio para parsear y validar mensajes WebSocket
 */
export class WebSocketMessageParser {
  /**
   * Parsea el body del evento WebSocket a un DTO
   * @param event - Evento de WebSocket
   * @returns DTO parseado o null si es inválido
   */
  parseMessage(event: APIGatewayProxyWebsocketEventV2): WebSocketMessageDto | null {
    try {
      const body = event.body || '{}';
      const messageData = JSON.parse(body) as WebSocketMessageDto;

      // Validar que tenga una acción
      if (!messageData.action) {
        return null;
      }

      return messageData;
    } catch (error) {
      console.error('Error parseando mensaje WebSocket:', error);
      return null;
    }
  }

  /**
   * Valida que un mensaje tenga los campos requeridos para su acción
   * @param message - Mensaje a validar
   * @returns true si es válido, false en caso contrario
   */
  validateMessage(message: WebSocketMessageDto): boolean {
    switch (message.action) {
      case WebSocketAction.SEND_MESSAGE:
        return !!(message.conversationId && message.content);

      case WebSocketAction.TYPING_START:
      case WebSocketAction.TYPING_STOP:
        return !!message.conversationId;

      case WebSocketAction.MARK_AS_READ:
        return !!(message.conversationId || message.messageId);

      case WebSocketAction.PING:
      case WebSocketAction.PONG:
        return true;

      default:
        return false;
    }
  }

  /**
   * Extrae el connectionId del evento
   * @param event - Evento de WebSocket
   * @returns connectionId o null
   */
  extractConnectionId(event: APIGatewayProxyWebsocketEventV2): string | null {
    return event.requestContext.connectionId || null;
  }
}

