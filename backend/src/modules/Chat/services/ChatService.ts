import { AppDataSource } from '../../../config/database';
import { IsNull } from 'typeorm';
import { Conversation } from '../entities/Conversation.entity';
import { Message } from '../entities/Message.entity';
import { TypingIndicator } from '../entities/TypingIndicator.entity';
import { type CreateConversationDto } from '../dto/CreateConversationDto';
import { type CreateMessageDto } from '../dto/CreateMessageDto';

/**
 * Servicio para gestionar conversaciones y mensajes
 */
export class ChatService {
  private get conversationRepository() {
    return AppDataSource.getRepository(Conversation);
  }

  private get messageRepository() {
    return AppDataSource.getRepository(Message);
  }

  private get typingIndicatorRepository() {
    return AppDataSource.getRepository(TypingIndicator);
  }

  /**
   * Crea una nueva conversación o devuelve la existente
   * @param createConversationDto - Datos de la conversación a crear
   * @returns Conversación creada o existente
   */
  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    // Verificar si ya existe una conversación entre estos dos usuarios
    const existingConversation = await this.conversationRepository.findOne({
      where: [
        {
          participant1Id: createConversationDto.participant1Id,
          participant2Id: createConversationDto.participant2Id
        },
        {
          participant1Id: createConversationDto.participant2Id,
          participant2Id: createConversationDto.participant1Id
        }
      ],
      relations: ['participant1', 'participant2']
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Crear nueva conversación
    const conversation = this.conversationRepository.create({
      participant1Id: createConversationDto.participant1Id,
      participant2Id: createConversationDto.participant2Id,
      lastMessageAt: null
    } as Conversation);

    const savedConversation = await this.conversationRepository.save(conversation);
    
    // Cargar relaciones
    const conversationWithRelations = await this.conversationRepository.findOne({
      where: { id: savedConversation.id },
      relations: ['participant1', 'participant2']
    });

    if (!conversationWithRelations) {
      throw new Error('Error al crear la conversación');
    }

    return conversationWithRelations;
  }

  /**
   * Obtiene una conversación por su ID
   * @param id - ID de la conversación
   * @returns Conversación encontrada
   */
  async getConversationById(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['participant1', 'participant2']
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    return conversation;
  }

  /**
   * Obtiene todas las conversaciones de un usuario con información adicional
   * @param userId - ID del usuario
   * @returns Lista de conversaciones del usuario con unreadCount y lastMessage
   */
  async getConversationsByUserId(userId: number): Promise<Array<Conversation & { unreadCount: number; lastMessage: Message | null }>> {
    const conversations = await this.conversationRepository.find({
      where: [
        { participant1Id: userId },
        { participant2Id: userId }
      ],
      relations: ['participant1', 'participant2'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' }
    });

    // Obtener conteo de mensajes no leídos y último mensaje para cada conversación
    const conversationsWithMetadata = await Promise.all(
      conversations.map(async (conversation) => {
        // Contar mensajes no leídos (mensajes enviados por el otro participante que no han sido leídos)
        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conversation.id,
            senderId: conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id,
            readAt: IsNull()
          }
        });

        // Obtener el último mensaje de la conversación
        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conversation.id },
          relations: ['sender'],
          order: { createdAt: 'DESC' }
        });

        return {
          ...conversation,
          unreadCount,
          lastMessage
        };
      })
    );

    return conversationsWithMetadata;
  }

  /**
   * Crea un nuevo mensaje
   * @param createMessageDto - Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    // Verificar que la conversación existe
    const conversation = await this.getConversationById(createMessageDto.conversationId);

    // Crear el mensaje
    const message = this.messageRepository.create({
      conversationId: createMessageDto.conversationId,
      senderId: createMessageDto.senderId,
      content: createMessageDto.content,
      readAt: null
    } as Message);

    const savedMessage = await this.messageRepository.save(message);

    // Actualizar lastMessageAt de la conversación
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    // Cargar relaciones
    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'conversation']
    });

    if (!messageWithRelations) {
      throw new Error('Error al crear el mensaje');
    }

    return messageWithRelations;
  }

  /**
   * Obtiene todos los mensajes de una conversación
   * @param conversationId - ID de la conversación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de mensajes paginada
   */
  async getMessagesByConversationId(
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Verificar que la conversación existe
    await this.getConversationById(conversationId);

    const skip = (page - 1) * limit;

    const [data, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Marca un mensaje como leído
   * @param messageId - ID del mensaje
   * @returns Mensaje actualizado
   */
  async markMessageAsRead(messageId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'conversation']
    });

    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    if (!message.readAt) {
      message.readAt = new Date();
      await this.messageRepository.save(message);
    }

    return message;
  }

  /**
   * Marca todos los mensajes de una conversación como leídos
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario que marca como leído
   * @returns Número de mensajes marcados como leídos
   */
  async markConversationMessagesAsRead(conversationId: number, userId: number): Promise<number> {
    // Verificar que la conversación existe y el usuario es participante
    const conversation = await this.getConversationById(conversationId);

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new Error('El usuario no es participante de esta conversación');
    }

    // Marcar todos los mensajes no leídos que no fueron enviados por el usuario
    const result = await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();

    return result.affected ?? 0;
  }

  /**
   * Inicia o actualiza el indicador de typing para un usuario en una conversación
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario que está escribiendo
   * @returns Indicador de typing actualizado
   */
  async startTyping(conversationId: number, userId: number): Promise<TypingIndicator> {
    let indicator = await this.typingIndicatorRepository.findOne({
      where: { conversationId, userId }
    });

    if (indicator) {
      indicator.isTyping = true;
      indicator.lastTypingAt = new Date();
    } else {
      indicator = this.typingIndicatorRepository.create({
        conversationId,
        userId,
        isTyping: true,
        lastTypingAt: new Date()
      } as TypingIndicator);
    }

    return await this.typingIndicatorRepository.save(indicator);
  }

  /**
   * Detiene el indicador de typing para un usuario en una conversación
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario que dejó de escribir
   * @returns Indicador de typing actualizado
   */
  async stopTyping(conversationId: number, userId: number): Promise<TypingIndicator | null> {
    const indicator = await this.typingIndicatorRepository.findOne({
      where: { conversationId, userId }
    });

    if (indicator) {
      indicator.isTyping = false;
      return await this.typingIndicatorRepository.save(indicator);
    }

    return null;
  }

  /**
   * Obtiene todos los usuarios que están escribiendo en una conversación
   * @param conversationId - ID de la conversación
   * @param excludeUserId - ID del usuario a excluir (el usuario actual)
   * @returns Lista de IDs de usuarios que están escribiendo
   */
  async getTypingUsers(conversationId: number, excludeUserId: number): Promise<number[]> {
    const indicators = await this.typingIndicatorRepository.find({
      where: {
        conversationId,
        isTyping: true
      }
    });

    // Filtrar usuarios que están escribiendo y no son el usuario actual
    // También limpiar indicadores antiguos (más de 5 segundos)
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - 5000);

    const activeTypingUsers = indicators
      .filter((indicator: TypingIndicator) => {
        if (indicator.userId === excludeUserId) return false;
        if (indicator.lastTypingAt < fiveSecondsAgo) {
          // Limpiar indicador antiguo
          this.typingIndicatorRepository.update(
            { id: indicator.id },
            { isTyping: false }
          ).catch(console.error);
          return false;
        }
        return true;
      })
      .map((indicator: TypingIndicator) => indicator.userId);

    return activeTypingUsers;
  }
}

