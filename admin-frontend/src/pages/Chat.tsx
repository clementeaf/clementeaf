import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Conversation, Message } from '../services/chatService';
import { chatService } from '../services/chatService';
import { useConversationsByUserId, useCreateMessage, useMessagesByConversationId, useCreateConversation } from '../hooks/useChat';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAllUsers } from '../hooks/useUsers';
import { useCurrentUser } from '../hooks/useAuth';
import { StartConversationModal } from './Chat/StartConversationModal';
import { ContactsList } from './Chat/ContactsList';
import { ChatHeader } from './Chat/ChatHeader';
import { MessageList } from './Chat/MessageList';
import { MessageInput } from './Chat/MessageInput';
import { EmptyChat } from './Chat/EmptyChat';

/**
 * Página de Chat
 * @returns Componente Chat
 */
export const Chat = () => {
  const { data: currentUser, error: currentUserError } = useCurrentUser();
  const [manualUserId, setManualUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('manualUserId');
    return stored ? parseInt(stored, 10) : null;
  });
  const currentUserId = currentUser?.id || manualUserId;

  useEffect(() => {
    if (currentUserError) {
      console.error('Error obteniendo usuario actual:', currentUserError);
    }
  }, [currentUserError]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isStartConversationModalOpen, setIsStartConversationModalOpen] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const queryClient = useQueryClient();

  const { data: conversationsData, isLoading: isLoadingConversations, refetch: refetchConversations } = useConversationsByUserId(currentUserId);
  
  // Asegurar que conversations sea siempre un array
  const conversations = Array.isArray(conversationsData) ? conversationsData : [];
  
  useEffect(() => {
    if (currentUserId) {
      refetchConversations();
    }
  }, [currentUserId, refetchConversations]);
  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useMessagesByConversationId(selectedConversation?.id || null);
  
  const allMessages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages.flatMap(page => page.data);
  }, [messagesData]);
  const { data: usersData, isLoading: isLoadingUsers } = useAllUsers();
  const createMessageMutation = useCreateMessage();
  const createConversationMutation = useCreateConversation();

  /**
   * Maneja la recepción de mensajes en tiempo real vía WebSocket
   */
  const handleWebSocketMessage = (message: Message): void => {
    if (message.conversationId === selectedConversation?.id) {
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
      // Marcar mensajes como leídos cuando se reciben en la conversación activa
      if (currentUserId && message.senderId !== currentUserId) {
        chatService.markConversationMessagesAsRead(message.conversationId, currentUserId).catch(console.error);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  /**
   * Maneja eventos de typing vía WebSocket
   */
  const handleWebSocketTyping = (data: { conversationId: number; userId: number; isTyping: boolean }): void => {
    if (data.conversationId === selectedConversation?.id && data.userId !== currentUserId) {
      setIsOtherUserTyping(data.isTyping);
      
      // Auto-detener typing después de 3 segundos si no hay actualización
      if (data.isTyping) {
        setTimeout(() => {
          setIsOtherUserTyping(false);
        }, 3000);
      }
    }
  };

  /**
   * Hook de WebSocket para recibir mensajes en tiempo real
   */
  useWebSocket({
    userId: currentUserId,
    onMessage: handleWebSocketMessage,
    onTyping: handleWebSocketTyping,
    onError: (error: Error) => {
      console.error('WebSocket error:', error);
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    }
  });


  /**
   * Maneja el envío de un mensaje
   */
  const handleSendMessage = async (): Promise<void> => {
    if (!messageContent.trim() || !selectedConversation || !currentUserId) {
      return;
    }

    try {
      await createMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        senderId: currentUserId,
        content: messageContent.trim()
      });
      setMessageContent('');
      
      // Marcar mensajes como leídos después de enviar
      await chatService.markConversationMessagesAsRead(selectedConversation.id, currentUserId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Obtiene el otro participante de la conversación
   */
  const getOtherParticipant = useCallback((conversation: Conversation): { id: number; name: string; email: string } => {
    if (!currentUserId) {
      return { id: 0, name: 'Unknown', email: 'unknown@example.com' };
    }

    const participant = conversation.participant1Id === currentUserId ? conversation.participant2 : conversation.participant1;
    
    if (!participant) {
      return { id: 0, name: 'Unknown', email: 'unknown@example.com' };
    }
    
    return {
      id: participant.id,
      name: participant.name || participant.email || 'Unknown',
      email: participant.email || 'unknown@example.com'
    };
  }, [currentUserId]);

  /**
   * Maneja la selección de un usuario para iniciar conversación
   */
  const handleSelectUser = async (selectedUserId: number): Promise<void> => {
    let participant1Id = currentUserId;
    const participant2Id = selectedUserId;
    
    if (!participant1Id && usersData?.data && usersData.data.length > 0) {
      const otherUser = usersData.data.find(u => u.id !== selectedUserId);
      if (otherUser) {
        participant1Id = otherUser.id;
      } else {
        participant1Id = selectedUserId;
      }
    }
    
    if (!participant1Id) {
      participant1Id = selectedUserId;
    }

    try {
      const newConversation = await createConversationMutation.mutateAsync({
        participant1Id,
        participant2Id
      });

      if (!currentUserId && participant1Id) {
        setManualUserId(participant1Id);
        localStorage.setItem('manualUserId', participant1Id.toString());
      }

      setSelectedConversation(newConversation);
      setIsStartConversationModalOpen(false);
      
      const finalUserId = currentUserId || participant1Id;
      if (finalUserId) {
        queryClient.invalidateQueries({ queryKey: ['conversations', finalUserId] });
        queryClient.invalidateQueries({ queryKey: ['conversations', participant2Id] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex">
        <ContactsList
          conversations={conversations}
          isLoading={isLoadingConversations}
          selectedConversationId={selectedConversation?.id || null}
          onSelectConversation={setSelectedConversation}
          onStartConversation={() => setIsStartConversationModalOpen(true)}
          getOtherParticipant={getOtherParticipant}
          currentUserId={currentUserId}
        />

        <div className="flex-1 flex flex-col w-full">
          {selectedConversation ? (
            <>
              <ChatHeader
                name={getOtherParticipant(selectedConversation).name}
                isTyping={isOtherUserTyping}
              />
              <MessageList
                messages={allMessages}
                isLoading={isLoadingMessages}
                currentUserId={currentUserId}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={() => fetchNextPage()}
              />
              <MessageInput
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onSend={handleSendMessage}
                isSending={createMessageMutation.isPending}
                conversationId={selectedConversation.id}
                userId={currentUserId}
              />
            </>
          ) : (
            <EmptyChat />
          )}
        </div>
      </div>

      <StartConversationModal
        isOpen={isStartConversationModalOpen}
        onClose={() => setIsStartConversationModalOpen(false)}
        onSelectUser={handleSelectUser}
        users={usersData?.data || []}
        isLoading={isLoadingUsers}
        currentUserId={currentUserId}
      />
    </div>
  );
};

