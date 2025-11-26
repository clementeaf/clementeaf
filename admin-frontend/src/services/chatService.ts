import { apiClient } from './api';
import { endpoints } from '../api/endpoints';

/**
 * DTO para crear una conversación
 */
export interface CreateConversationDto {
  participant1Id: number;
  participant2Id: number;
}

/**
 * DTO para crear un mensaje
 */
export interface CreateMessageDto {
  conversationId: number;
  senderId: number;
  content: string;
}

/**
 * Usuario participante
 */
export interface Participant {
  id: number;
  email: string;
  name: string | null;
}

/**
 * Conversación
 */
export interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  participant1: Participant;
  participant2: Participant;
  lastMessageAt: string | null;
  unreadCount: number;
  lastMessage: {
    id: number;
    content: string;
    senderId: number;
    sender: Participant;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mensaje
 */
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  sender: Participant;
  content: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de mensajes
 */
export interface PaginatedMessagesResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar chat
 */
export const chatService = {
  /**
   * Crea una nueva conversación
   * @param conversationData - Datos de la conversación a crear
   * @returns Conversación creada
   */
  async createConversation(conversationData: CreateConversationDto): Promise<Conversation> {
    const { data } = await apiClient.post<{ data: Conversation; message: string }>(
      endpoints.chat.conversations,
      conversationData
    );
    return data.data;
  },

  /**
   * Obtiene una conversación por su ID
   * @param conversationId - ID de la conversación
   * @returns Conversación encontrada
   */
  async getConversationById(conversationId: number): Promise<Conversation> {
    const url = endpoints.chat.conversationById.replace('{conversationId}', conversationId.toString());
    const { data } = await apiClient.get<{ data: Conversation }>(url);
    return data.data;
  },

  /**
   * Obtiene todas las conversaciones de un usuario
   * @param userId - ID del usuario
   * @returns Lista de conversaciones
   */
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    const url = endpoints.chat.conversationsByUser.replace('{userId}', userId.toString());
    const { data } = await apiClient.get<{ data: { data: Conversation[]; total: number } }>(url);
    // El backend devuelve { data: { data: [...], total: ... } }
    return Array.isArray(data.data.data) ? data.data.data : (Array.isArray(data.data) ? data.data : []);
  },

  /**
   * Crea un nuevo mensaje
   * @param messageData - Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(messageData: CreateMessageDto): Promise<Message> {
    const { data } = await apiClient.post<{ data: Message; message: string }>(
      endpoints.chat.messages,
      messageData
    );
    return data.data;
  },

  /**
   * Obtiene todos los mensajes de una conversación
   * @param conversationId - ID de la conversación
   * @param page - Número de página
   * @param limit - Límite de resultados por página (default: 20, como WhatsApp)
   * @returns Lista de mensajes paginada
   */
  async getMessagesByConversationId(
    conversationId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedMessagesResponse> {
    const url = endpoints.chat.messagesByConversation.replace('{conversationId}', conversationId.toString());
    const { data } = await apiClient.get<{ data: PaginatedMessagesResponse }>(url, {
      params: { page, limit }
    });
    return data.data;
  },

  /**
   * Marca un mensaje como leído
   * @param messageId - ID del mensaje
   * @returns Mensaje actualizado
   */
  async markMessageAsRead(messageId: number): Promise<Message> {
    const url = endpoints.chat.markMessageRead.replace('{messageId}', messageId.toString());
    const { data } = await apiClient.put<{ data: Message }>(url);
    return data.data;
  },

  /**
   * Marca todos los mensajes de una conversación como leídos
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario
   * @returns Número de mensajes marcados como leídos
   */
  async markConversationMessagesAsRead(conversationId: number, userId: number): Promise<number> {
    const url = endpoints.chat.markConversationRead.replace('{conversationId}', conversationId.toString());
    const { data } = await apiClient.put<{ data: { conversationId: number; messagesMarkedAsRead: number }; message: string }>(
      url,
      { userId }
    );
    return data.data.messagesMarkedAsRead;
  },

  /**
   * Inicia el indicador de typing
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario que está escribiendo
   */
  async startTyping(conversationId: number, userId: number): Promise<void> {
    await apiClient.post(endpoints.chat.startTyping, { conversationId, userId });
  },

  /**
   * Detiene el indicador de typing
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario que dejó de escribir
   */
  async stopTyping(conversationId: number, userId: number): Promise<void> {
    await apiClient.post(endpoints.chat.stopTyping, { conversationId, userId });
  }
};

