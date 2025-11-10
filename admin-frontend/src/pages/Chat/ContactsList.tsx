import type { Conversation } from '../../services/chatService';
import { Button, PlusIcon } from '../../components/commons';

interface ContactsListProps {
  conversations: Conversation[];
  isLoading: boolean;
  isConnected: boolean;
  selectedConversationId: number | null;
  onSelectConversation: (conversation: Conversation) => void;
  onStartConversation: () => void;
  getOtherParticipant: (conversation: Conversation) => { id: number; name: string; email: string };
}

/**
 * Componente para mostrar la lista de contactos/conversaciones
 * @param conversations - Lista de conversaciones
 * @param isLoading - Indica si se están cargando las conversaciones
 * @param isConnected - Indica si el WebSocket está conectado
 * @param selectedConversationId - ID de la conversación seleccionada
 * @param onSelectConversation - Función que se ejecuta al seleccionar una conversación
 * @param onStartConversation - Función que se ejecuta al iniciar una nueva conversación
 * @param getOtherParticipant - Función para obtener el otro participante de una conversación
 * @returns Componente ContactsList
 */
export const ContactsList = ({
  conversations,
  isLoading,
  isConnected,
  selectedConversationId,
  onSelectConversation,
  onStartConversation,
  getOtherParticipant
}: ContactsListProps) => {
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
          <div className="p-4 text-center text-gray-500">Cargando conversaciones...</div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversationId === conversation.id;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                >
                  <div className="flex flex-col items-start">
                    <p className="font-medium text-gray-900">{otherParticipant.name}</p>
                    <p className="text-sm text-gray-500">{otherParticipant.email}</p>
                  </div>
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
  );
};

