import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatService, type CreateConversationDto, type CreateMessageDto, type Conversation, type PaginatedMessagesResponse } from '../services/chatService';

/**
 * Hook para crear una conversación
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationData: CreateConversationDto) => chatService.createConversation(conversationData),
    onSuccess: (newConversation) => {
      const participantIds = [newConversation.participant1Id, newConversation.participant2Id];
      
      participantIds.forEach((userId) => {
        queryClient.setQueriesData<Conversation[]>(
          { queryKey: ['conversations', userId] },
          (oldData) => {
            if (!oldData) {
              return [newConversation];
            }
            
            const exists = oldData.some(conv => conv.id === newConversation.id);
            if (exists) {
              return oldData;
            }
            
            return [newConversation, ...oldData];
          }
        );
      });
      
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
 * Los mensajes se cargan desde los más recientes (última página) hacia atrás
 * @param conversationId - ID de la conversación
 * @param limit - Límite de resultados por página (default: 20, como WhatsApp)
 */
export const useMessagesByConversationId = (conversationId: number | null, limit: number = 20) => {
  return useInfiniteQuery<PaginatedMessagesResponse, Error, PaginatedMessagesResponse, [string, number | null, number], number | 'last'>({
    queryKey: ['messages', conversationId, limit],
    queryFn: async ({ pageParam = 'last' }) => {
      if (!conversationId) throw new Error('Conversation ID is required');
      // pageParam puede ser un número (página) o 'last' para la última página
      if (pageParam === 'last') {
        // Primero obtener el total para calcular la última página
        const firstPage = await chatService.getMessagesByConversationId(conversationId, 1, limit);
        const lastPageNumber = firstPage.totalPages;
        return chatService.getMessagesByConversationId(conversationId, lastPageNumber, limit);
      }
      return chatService.getMessagesByConversationId(conversationId, pageParam as number, limit);
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    initialPageParam: 'last' as const,
    getNextPageParam: (lastPage) => {
      // Cargar página anterior (mensajes más antiguos) cuando se hace scroll hacia arriba
      if (lastPage.page > 1) {
        return lastPage.page - 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      // Cargar página siguiente (mensajes más recientes) cuando se hace scroll hacia abajo
      if (firstPage.page < firstPage.totalPages) {
        return firstPage.page + 1;
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

