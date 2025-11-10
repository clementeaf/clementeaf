import type { Message } from '../../services/chatService';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

/**
 * Componente para mostrar un mensaje individual
 * @param message - Mensaje a mostrar
 * @param isOwnMessage - Indica si el mensaje es propio
 * @returns Componente MessageItem
 */
export const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
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
};

