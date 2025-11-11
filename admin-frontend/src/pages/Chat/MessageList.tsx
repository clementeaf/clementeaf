import { useEffect, useRef, useMemo, memo, useCallback } from 'react';
import type { Message } from '../../services/chatService';
import { MessageItem } from './MessageItem';
import { MessageListSkeleton } from './MessageListSkeleton';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: number | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

/**
 * Componente para mostrar la lista de mensajes con paginación infinita
 * @param messages - Lista de mensajes (aplanada de todas las páginas)
 * @param isLoading - Indica si se están cargando los mensajes
 * @param currentUserId - ID del usuario actual
 * @param hasNextPage - Indica si hay más páginas disponibles
 * @param isFetchingNextPage - Indica si se están cargando más mensajes
 * @param onLoadMore - Función para cargar más mensajes
 * @returns Componente MessageList
 */
export const MessageList = memo(({ 
  messages, 
  isLoading, 
  currentUserId,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const messagesWithOwnership = useMemo(() => {
    return messages.map((message) => ({
      message,
      isOwnMessage: message.senderId === currentUserId
    }));
  }, [messages, currentUserId]);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    
    if (scrollTop < 100 && hasNextPage && !isFetchingNextPage && !isLoadingMoreRef.current && onLoadMore) {
      isLoadingMoreRef.current = true;
      onLoadMore();
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 1000);
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading && messages.length === 0) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500">No hay mensajes</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {isFetchingNextPage && (
        <div className="p-2 text-center text-gray-500 text-sm">Cargando más mensajes...</div>
      )}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messagesWithOwnership.map(({ message, isOwnMessage }) => (
          <MessageItem key={message.id} message={message} isOwnMessage={isOwnMessage} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';

