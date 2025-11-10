import { useEffect, useRef } from 'react';
import type { Message } from '../../services/chatService';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: number | null;
}

/**
 * Componente para mostrar la lista de mensajes
 * @param messages - Lista de mensajes
 * @param isLoading - Indica si se están cargando los mensajes
 * @param currentUserId - ID del usuario actual
 * @returns Componente MessageList
 */
export const MessageList = ({ messages, isLoading, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500">Cargando mensajes...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500">No hay mensajes</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUserId;
        return <MessageItem key={message.id} message={message} isOwnMessage={isOwnMessage} />;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

