/**
 * DTO para crear un mensaje
 */
export interface CreateMessageDto {
  conversationId: number;
  senderId: number;
  content: string;
}

