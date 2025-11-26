import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatService, type CreateConversationDto, type CreateMessageDto, type Conversation } from '../services/chatService';

/**
 * Hook para crear una conversación
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationData: CreateConversationDto) => chatService.createConversation(conversationData),
    onSuccess: (newConversation) => {
      // Actualizar optimísticamente la lista de conversaciones para todos los usuarios participantes
      const participantIds = [newConversation.participant1Id, newConversation.participant2Id];
      
      participantIds.forEach((userId) => {
        queryClient.setQueriesData<Conversation[]>(
          { queryKey: ['conversations', userId] },
          (oldData) => {
            if (!oldData) {
              return [newConversation];
            }
            
            // Verificar si la conversación ya existe
            const exists = oldData.some(conv => conv.id === newConversation.id);
            if (exists) {
              return oldData;
            }
            
            // Agregar la nueva conversación al inicio de la lista
            return [newConversation, ...oldData];
          }
        );
      });
      
      // Invalidar para asegurar sincronización con el servidor
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

/**
 * Hook para obtener una conversación por su ID
 * @param conversationId - ID de la conversación
 */
export const useConversationById = (conversationId: number | null) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return chatService.getConversationById(conversationId);
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5
  });
};

/**
 * Hook para obtener todas las conversaciones de un usuario
 * @param userId - ID del usuario
 */
export const useConversationsByUserId = (userId: number | null) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return chatService.getConversationsByUserId(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10 // 10 minutos (antes cacheTime)
  });
};

/**
 * Hook para crear un mensaje
 */
export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: CreateMessageDto) => chatService.createMessage(messageData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

/**
 * Hook para obtener mensajes de una conversación con paginación infinita
 * @param conversationId - ID de la conversación
 * @param limit - Límite de resultados por página (default: 20, como WhatsApp)
 */
export const useMessagesByConversationId = (conversationId: number | null, limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId, limit],
    queryFn: ({ pageParam = 1 }) => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return chatService.getMessagesByConversationId(conversationId, pageParam, limit);
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.page > 1) {
        return firstPage.page - 1;
      }
      return undefined;
    }
  });
};

/**
 * Hook para marcar un mensaje como leído
 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => chatService.markMessageAsRead(messageId),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
    }
  });
};

/**
 * Hook para marcar todos los mensajes de una conversación como leídos
 */
export const useMarkConversationMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: number; userId: number }) =>
      chatService.markConversationMessagesAsRead(conversationId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    }
  });
};

