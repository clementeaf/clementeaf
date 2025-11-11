import { memo, useMemo } from 'react';
import type { Conversation } from '../../services/chatService';
import { Button, PlusIcon } from '../../components/commons';
import { ContactsListSkeleton } from './ContactsListSkeleton';
import { formatConversationDate } from '../../utils/dateUtils';

interface ContactsListProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversationId: number | null;
  onSelectConversation: (conversation: Conversation) => void;
  onStartConversation: () => void;
  getOtherParticipant: (conversation: Conversation) => { id: number; name: string; email: string };
  currentUserId: number | null;
}

/**
 * Componente para mostrar la lista de contactos/conversaciones
 * @param conversations - Lista de conversaciones
 * @param isLoading - Indica si se están cargando las conversaciones
 * @param selectedConversationId - ID de la conversación seleccionada
 * @param onSelectConversation - Función que se ejecuta al seleccionar una conversación
 * @param onStartConversation - Función que se ejecuta al iniciar una nueva conversación
 * @param getOtherParticipant - Función para obtener el otro participante de una conversación
 * @returns Componente ContactsList
 */
export const ContactsList = memo(({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
  onStartConversation,
  getOtherParticipant,
  currentUserId
}: ContactsListProps) => {
  const conversationItems = useMemo(() => {
    return conversations.map((conversation) => {
      const otherParticipant = getOtherParticipant(conversation);
      const isSelected = selectedConversationId === conversation.id;
      const formattedDate = formatConversationDate(conversation.lastMessageAt);
      
      // Obtener preview del último mensaje
      const lastMessagePreview = conversation.lastMessage
        ? conversation.lastMessage.content.length > 50
          ? conversation.lastMessage.content.substring(0, 50) + '...'
          : conversation.lastMessage.content
        : null;
      
      // Verificar si el último mensaje es del usuario actual
      const isLastMessageFromCurrentUser = conversation.lastMessage && currentUserId
        ? conversation.lastMessage.senderId === currentUserId
        : false;

      return {
        conversation,
        otherParticipant,
        isSelected,
        formattedDate,
        unreadCount: conversation.unreadCount || 0,
        lastMessagePreview,
        isLastMessageFromCurrentUser
      };
    });
  }, [conversations, selectedConversationId, getOtherParticipant, currentUserId]);

  return (
    <div className="w-[20%] border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Contactos</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={onStartConversation}
              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 text-sm flex items-center gap-1"
              leftIcon={<PlusIcon />}
            >
              Iniciar conversación
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ContactsListSkeleton />
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {conversationItems.map(({ 
              conversation, 
              otherParticipant, 
              isSelected, 
        formattedDate,
        unreadCount,
        lastMessagePreview,
        isLastMessageFromCurrentUser
            }) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-start justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  } ${unreadCount > 0 && !isSelected ? 'bg-gray-50' : ''}`}
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <div className="flex items-center gap-2 w-full">
                    <p className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>
                      {otherParticipant.name}
                    </p>
                    {unreadCount > 0 && (
                      <span className="flex-shrink-0 bg-blue-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {lastMessagePreview && (
                    <p className={`text-sm truncate w-full mt-1 ${
                      unreadCount > 0 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {isLastMessageFromCurrentUser ? 'Tú: ' : ''}{lastMessagePreview}
                    </p>
                  )}
                  {!lastMessagePreview && (
                    <p className="text-sm text-gray-400 mt-1">Sin mensajes</p>
                  )}
                </div>
                {formattedDate && (
                  <div className={`text-xs ml-2 flex-shrink-0 ${
                    unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}>
                    {formattedDate}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No hay conversaciones</div>
        )}
      </div>
    </div>
  );
});

ContactsList.displayName = 'ContactsList';

