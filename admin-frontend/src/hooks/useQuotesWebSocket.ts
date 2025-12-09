import { useWebSocketEvents, type WebSocketEventConfig } from './useWebSocketEvents';

interface UseQuotesWebSocketOptions {
  onQuoteCreated?: () => void;
  onQuoteUpdated?: () => void;
  onQuoteDeleted?: (quoteId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de quotes vía WebSocket
 * @param options - Opciones de configuración
 * @returns Función para desconectar manualmente
 */
export const useQuotesWebSocket = (options: UseQuotesWebSocketOptions = {}) => {
  const { onQuoteCreated, onQuoteUpdated, onQuoteDeleted, onError } = options;

  const events: WebSocketEventConfig[] = [
    {
      action: 'quote_created',
      queryKeys: [['quotes']],
      onEvent: onQuoteCreated ? () => onQuoteCreated() : undefined
    },
    {
      action: 'quote_updated',
      queryKeys: [['quotes']],
      queryKeysWithId: (id: string) => [['quote', id]],
      onEvent: onQuoteUpdated ? () => onQuoteUpdated() : undefined
    },
    {
      action: 'quote_deleted',
      queryKeys: [['quotes']],
      onEvent: onQuoteDeleted 
        ? (data: unknown) => {
            if (typeof data === 'object' && data !== null && 'quoteId' in data) {
              const quoteId = String((data as { quoteId: unknown }).quoteId);
              onQuoteDeleted(quoteId);
            }
          }
        : undefined
    }
  ];

  return useWebSocketEvents({
    events,
    onError,
    logPrefix: 'QUOTES WS'
  });
};

