import { AppDataSource } from '../../../config/database';
import { Conversation } from '../entities/Conversation.entity';

/**
 * Repositorio para gestionar conversaciones y mensajes
 * Abstrae el acceso a la base de datos
 */
export class ChatRepository {
  private get conversationRepository() {
    return AppDataSource.getRepository(Conversation);
  }

  /**
   * Obtiene una conversación por ID con sus participantes
   * @param conversationId - ID de la conversación
   * @returns Conversación encontrada o null
   */
  async findConversationById(conversationId: number): Promise<Conversation | null> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
        relations: ['participant1', 'participant2']
      });

      return conversation;
    } catch (error) {
      console.error('Error obteniendo conversación:', error);
      return null;
    }
  }

  /**
   * Verifica si un usuario es participante de una conversación
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario
   * @returns true si el usuario es participante
   */
  async isParticipant(conversationId: number, userId: number): Promise<boolean> {
    try {
      const conversation = await this.findConversationById(conversationId);
      if (!conversation) {
        return false;
      }

      return conversation.participant1Id === userId || conversation.participant2Id === userId;
    } catch (error) {
      console.error('Error verificando participante:', error);
      return false;
    }
  }

  /**
   * Obtiene los IDs de los participantes de una conversación
   * @param conversationId - ID de la conversación
   * @returns Array con los IDs de los participantes
   */
  async getParticipantIds(conversationId: number): Promise<number[]> {
    try {
      const conversation = await this.findConversationById(conversationId);
      if (!conversation) {
        return [];
      }

      return [conversation.participant1Id, conversation.participant2Id];
    } catch (error) {
      console.error('Error obteniendo participantes:', error);
      return [];
    }
  }
}

