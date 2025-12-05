import { ChatService } from './ChatService';
import { WebSocketConnectionService } from './WebSocketConnectionService';
import { ChatRepository } from '../repositories/ChatRepository';
import { WebSocketMessageDto, WebSocketAction } from '../dto/websocket/WebSocketMessageDto';
import { WebSocketResponseDto } from '../dto/websocket/WebSocketResponseDto';

/**
 * Servicio para procesar mensajes WebSocket
 * Separa la lógica de negocio del manejo de conexiones
 */
export class WebSocketMessageService {
  private chatService: ChatService;
  private connectionService: WebSocketConnectionService;
  private chatRepository: ChatRepository;

  constructor(connectionService: WebSocketConnectionService) {
    this.chatService = new ChatService();
    this.connectionService = connectionService;
    this.chatRepository = new ChatRepository();
  }

  /**
   * Procesa un mensaje WebSocket según su acción
   * @param message - Mensaje a procesar
   * @param userId - ID del usuario que envía el mensaje
   * @returns Respuesta del procesamiento
   */
  async processMessage(message: WebSocketMessageDto, userId: number): Promise<WebSocketResponseDto> {
    switch (message.action) {
      case WebSocketAction.SEND_MESSAGE:
        return await this.handleSendMessage(message, userId);

      case WebSocketAction.TYPING_START:
        return await this.handleTypingStart(message, userId);

      case WebSocketAction.TYPING_STOP:
        return await this.handleTypingStop(message, userId);

      case WebSocketAction.MARK_AS_READ:
        return await this.handleMarkAsRead(message, userId);

      case WebSocketAction.PING:
        return { success: true, action: WebSocketAction.PONG };

      default:
        return {
          success: false,
          error: `Acción desconocida: ${message.action}`
        };
    }
  }

  /**
   * Maneja el envío de un mensaje
   * @param message - Mensaje a enviar
   * @param userId - ID del usuario que envía
   * @returns Respuesta del procesamiento
   */
  private async handleSendMessage(message: WebSocketMessageDto, userId: number): Promise<WebSocketResponseDto> {
    if (!message.conversationId || !message.content) {
      return {
        success: false,
        error: 'conversationId y content son requeridos'
      };
    }

    const conversationId = parseInt(message.conversationId, 10);
    if (isNaN(conversationId)) {
      return {
        success: false,
        error: 'conversationId inválido'
      };
    }

    // Verificar que el usuario es participante de la conversación
    const isParticipant = await this.chatRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      return {
        success: false,
        error: 'Usuario no es participante de esta conversación'
      };
    }

    // Crear el mensaje
    const createdMessage = await this.chatService.createMessage({
      conversationId,
      senderId: userId,
      content: message.content
    });

    // Obtener participantes y enviar el mensaje vía WebSocket
    const participantIds = await this.chatRepository.getParticipantIds(conversationId);
    const otherParticipantIds = participantIds.filter(id => id !== userId);
    
    if (otherParticipantIds.length > 0) {
      await this.connectionService.sendToUsers(otherParticipantIds, {
        action: 'new_message',
        message: {
          id: createdMessage.id,
          conversationId: createdMessage.conversationId,
          senderId: createdMessage.senderId,
          content: createdMessage.content,
          createdAt: createdMessage.createdAt
        }
      });
    }

    return {
      success: true,
      action: WebSocketAction.SEND_MESSAGE,
      messageId: createdMessage.id
    };
  }

  /**
   * Maneja el inicio de typing
   * @param message - Mensaje con información de typing
   * @param userId - ID del usuario que está escribiendo
   * @returns Respuesta del procesamiento
   */
  private async handleTypingStart(message: WebSocketMessageDto, userId: number): Promise<WebSocketResponseDto> {
    if (!message.conversationId) {
      return {
        success: false,
        error: 'conversationId es requerido'
      };
    }

    const conversationId = parseInt(message.conversationId, 10);
    if (isNaN(conversationId)) {
      return {
        success: false,
        error: 'conversationId inválido'
      };
    }

    // Actualizar indicador de typing
    await this.chatService.startTyping(conversationId, userId);

    // Notificar a otros participantes
    const participantIds = await this.chatRepository.getParticipantIds(conversationId);
    const otherParticipantIds = participantIds.filter(id => id !== userId);
    
    if (otherParticipantIds.length > 0) {
      await this.connectionService.sendToUsers(otherParticipantIds, {
        action: 'typing_start',
        conversationId,
        userId
      });
    }

    return {
      success: true,
      action: WebSocketAction.TYPING_START
    };
  }

  /**
   * Maneja el fin de typing
   * @param message - Mensaje con información de typing
   * @param userId - ID del usuario que dejó de escribir
   * @returns Respuesta del procesamiento
   */
  private async handleTypingStop(message: WebSocketMessageDto, userId: number): Promise<WebSocketResponseDto> {
    if (!message.conversationId) {
      return {
        success: false,
        error: 'conversationId es requerido'
      };
    }

    const conversationId = parseInt(message.conversationId, 10);
    if (isNaN(conversationId)) {
      return {
        success: false,
        error: 'conversationId inválido'
      };
    }

    // Actualizar indicador de typing
    await this.chatService.stopTyping(conversationId, userId);

    // Notificar a otros participantes
    const participantIds = await this.chatRepository.getParticipantIds(conversationId);
    const otherParticipantIds = participantIds.filter(id => id !== userId);
    
    if (otherParticipantIds.length > 0) {
      await this.connectionService.sendToUsers(otherParticipantIds, {
        action: 'typing_stop',
        conversationId,
        userId
      });
    }

    return {
      success: true,
      action: WebSocketAction.TYPING_STOP
    };
  }

  /**
   * Maneja el marcado de mensaje como leído
   * @param message - Mensaje con información de lectura
   * @param userId - ID del usuario que marca como leído
   * @returns Respuesta del procesamiento
   */
  private async handleMarkAsRead(message: WebSocketMessageDto, userId: number): Promise<WebSocketResponseDto> {
    if (message.messageId) {
      // Marcar un mensaje específico como leído
      const messageId = parseInt(message.messageId, 10);
      if (isNaN(messageId)) {
        return {
          success: false,
          error: 'messageId inválido'
        };
      }

      await this.chatService.markMessageAsRead(messageId);
      return {
        success: true,
        action: WebSocketAction.MARK_AS_READ
      };
    }

    if (message.conversationId) {
      // Marcar todos los mensajes de una conversación como leídos
      const conversationId = parseInt(message.conversationId, 10);
      if (isNaN(conversationId)) {
        return {
          success: false,
          error: 'conversationId inválido'
        };
      }

      await this.chatService.markConversationMessagesAsRead(conversationId, userId);
      return {
        success: true,
        action: WebSocketAction.MARK_AS_READ
      };
    }

    return {
      success: false,
      error: 'messageId o conversationId es requerido'
    };
  }
}

