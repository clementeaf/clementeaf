import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Conversation, Message } from '../services/chatService';
import { useConversationsByUserId, useCreateMessage, useMessagesByConversationId, useCreateConversation } from '../hooks/useChat';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAllUsers } from '../hooks/useUsers';
import { Button, Input, PlusIcon } from '../components/commons';
import { StartConversationModal } from './Chat/StartConversationModal';

/**
 * Obtiene el ID del usuario actual desde localStorage
 * TODO: Reemplazar con un hook de autenticación real
 */
const getCurrentUserId = (): number | null => {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId, 10) : null;
};

/**
 * Página de Chat
 * @returns Componente Chat
 */
export const Chat = () => {
  const currentUserId = getCurrentUserId();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isStartConversationModalOpen, setIsStartConversationModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations } = useConversationsByUserId(currentUserId);
  const { data: messagesData, isLoading: isLoadingMessages } = useMessagesByConversationId(
    selectedConversation?.id || null
  );
  const { data: usersData, isLoading: isLoadingUsers } = useAllUsers();
  const createMessageMutation = useCreateMessage();
  const createConversationMutation = useCreateConversation();

  /**
   * Maneja la recepción de mensajes en tiempo real vía WebSocket
   */
  const handleWebSocketMessage = (message: Message): void => {
    if (message.conversationId === selectedConversation?.id) {
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
    }
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  /**
   * Hook de WebSocket para recibir mensajes en tiempo real
   */
  const { isConnected } = useWebSocket({
    userId: currentUserId,
    onMessage: handleWebSocketMessage,
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
   * Scroll automático al final de los mensajes
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Obtiene el otro participante de la conversación
   */
  const getOtherParticipant = (conversation: Conversation): { id: number; name: string; email: string } => {
    if (!currentUserId) {
      return { id: 0, name: 'Unknown', email: 'unknown@example.com' };
    }

    const participant = conversation.participant1Id === currentUserId ? conversation.participant2 : conversation.participant1;
    return {
      id: participant.id,
      name: participant.name || participant.email,
      email: participant.email
    };
  };

  /**
   * Maneja la selección de un usuario para iniciar conversación
   */
  const handleSelectUser = async (selectedUserId: number): Promise<void> => {
    if (!currentUserId) return;

    try {
      const newConversation = await createConversationMutation.mutateAsync({
        participant1Id: currentUserId,
        participant2Id: selectedUserId
      });

      setSelectedConversation(newConversation);
      setIsStartConversationModalOpen(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex">
        {/* Sección de Contactos */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Contactos</h2>
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Conectado"></span>
              )}
              <Button
                onClick={() => setIsStartConversationModalOpen(true)}
                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 text-sm flex items-center gap-1"
                leftIcon={<PlusIcon />}
              >
                Iniciar conversación
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-4 text-center text-gray-500">Cargando conversaciones...</div>
            ) : conversations && conversations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation: Conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const isSelected = selectedConversation?.id === conversation.id;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{otherParticipant.name}</div>
                      <div className="text-sm text-gray-500">{otherParticipant.email}</div>
                      {conversation.lastMessageAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No hay conversaciones</div>
            )}
          </div>
        </div>

        {/* Sección de Chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {getOtherParticipant(selectedConversation).name}
                </h2>
                <p className="text-sm text-gray-500">{getOtherParticipant(selectedConversation).email}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="text-center text-gray-500">Cargando mensajes...</div>
                ) : messagesData && messagesData.data.length > 0 ? (
                  <>
                    {messagesData.data.map((message: Message) => {
                      const isOwnMessage = message.senderId === currentUserId;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="text-center text-gray-500">No hay mensajes</div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <Input
                  value={messageContent}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMessageContent(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  inputClassName="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || createMessageMutation.isPending}
                >
                  {createMessageMutation.isPending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">Selecciona una conversación</p>
                <p className="text-sm">Elige un contacto para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para iniciar conversación */}
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

