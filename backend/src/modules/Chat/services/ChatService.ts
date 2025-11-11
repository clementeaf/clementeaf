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
   * Obtiene todas las conversaciones de un usuario con información adicional (optimizado - evita N+1)
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

    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map(c => c.id);

    // Obtener todos los últimos mensajes en paralelo (más eficiente que N+1 secuencial)
    const lastMessagesPromises = conversationIds.map(convId =>
      this.messageRepository.findOne({
        where: { conversationId: convId },
        relations: ['sender'],
        order: { createdAt: 'DESC' }
      })
    );
    
    const lastMessagesResults = await Promise.all(lastMessagesPromises);
    const lastMessages = lastMessagesResults.filter((msg): msg is Message => msg !== null);

    // Crear mapa de último mensaje por conversación
    const lastMessageMap = new Map<number, Message>();
    lastMessages.forEach(msg => {
      const existing = lastMessageMap.get(msg.conversationId);
      if (!existing || msg.createdAt > existing.createdAt) {
        lastMessageMap.set(msg.conversationId, msg);
      }
    });

    // Obtener conteos de mensajes no leídos en batch usando queries paralelas
    // Esto es más eficiente que N+1 queries secuenciales
    const unreadCountPromises = conversations.map(conv => {
      const otherParticipantId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      return this.messageRepository.count({
        where: {
          conversationId: conv.id,
          senderId: otherParticipantId,
          readAt: IsNull()
        }
      }).then(count => ({ conversationId: conv.id, count }));
    });

    const unreadCountsResults = await Promise.all(unreadCountPromises);

    // Crear mapa de conteos no leídos
    const unreadCountMap = new Map<number, number>();
    unreadCountsResults.forEach(({ conversationId, count }) => {
      unreadCountMap.set(conversationId, count);
    });

    // Combinar resultados
    return conversations.map(conversation => ({
      ...conversation,
      unreadCount: unreadCountMap.get(conversation.id) || 0,
      lastMessage: lastMessageMap.get(conversation.id) || null
    }));
  }

  /**
   * Crea un nuevo mensaje (optimizado - reduce queries)
   * @param createMessageDto - Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    // Verificar que la conversación existe y obtener datos necesarios en una sola query
    const conversation = await this.conversationRepository.findOne({
      where: { id: createMessageDto.conversationId },
      relations: ['participant1', 'participant2']
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    // Crear y guardar el mensaje con relaciones en una sola operación
    const message = this.messageRepository.create({
      conversationId: createMessageDto.conversationId,
      senderId: createMessageDto.senderId,
      content: createMessageDto.content,
      readAt: null
    } as Message);

    const savedMessage = await this.messageRepository.save(message);

    // Actualizar lastMessageAt de la conversación (no bloqueante, se puede hacer en paralelo)
    conversation.lastMessageAt = new Date();
    this.conversationRepository.save(conversation).catch(console.error);

    // Cargar relaciones del mensaje en una sola query optimizada
    const messageWithRelations = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .where('message.id = :id', { id: savedMessage.id })
      .getOne();

    if (!messageWithRelations) {
      throw new Error('Error al crear el mensaje');
    }

    return messageWithRelations;
  }

  /**
   * Obtiene todos los mensajes de una conversación (optimizado con índices)
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
    const skip = (page - 1) * limit;

    // Query optimizada usando query builder con índices
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await Promise.all([
      queryBuilder.getMany(),
      this.messageRepository.count({ where: { conversationId } })
    ]);

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

