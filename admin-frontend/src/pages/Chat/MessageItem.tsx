import { memo, useMemo } from 'react';
import type { Message } from '../../services/chatService';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

/**
 * Componente para mostrar un mensaje individual con indicadores de estado
 * @param message - Mensaje a mostrar
 * @param isOwnMessage - Indica si el mensaje es propio
 * @returns Componente MessageItem
 */
export const MessageItem = memo(({ message, isOwnMessage }: MessageItemProps) => {
  const formattedTime = useMemo(() => {
    return new Date(message.createdAt).toLocaleTimeString();
  }, [message.createdAt]);

  const getStatusIcon = (): string => {
    if (!isOwnMessage) return '';
    if (message.readAt) return '✓✓'; // Leído (doble check azul)
    return '✓'; // Enviado (check simple)
  };

  const getStatusColor = (): string => {
    if (!isOwnMessage) return '';
    if (message.readAt) return 'text-blue-300'; // Leído
    return 'text-gray-300'; // Enviado
  };

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
        <div className="flex items-center justify-end gap-1 mt-1">
          <p
            className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}
          >
            {formattedTime}
          </p>
          {isOwnMessage && (
            <span className={`text-xs ${getStatusColor()}`}>
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

