import { useWebSocketEvents, type WebSocketEventConfig } from './useWebSocketEvents';

interface UseClientsWebSocketOptions {
  onClientCreated?: () => void;
  onClientUpdated?: () => void;
  onClientDeleted?: (clientId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de clientes vía WebSocket
 * @param options - Opciones de configuración
 * @returns Función para desconectar manualmente
 */
export const useClientsWebSocket = (options: UseClientsWebSocketOptions = {}) => {
  const { onClientCreated, onClientUpdated, onClientDeleted, onError } = options;

  const events: WebSocketEventConfig[] = [
    {
      action: 'client_created',
      queryKeys: [['clients']],
      onEvent: onClientCreated ? () => onClientCreated() : undefined
    },
    {
      action: 'client_updated',
      queryKeys: [['clients']],
      queryKeysWithId: (id: string) => [['client', id]],
      onEvent: onClientUpdated ? () => onClientUpdated() : undefined
    },
    {
      action: 'client_deleted',
      queryKeys: [['clients']],
      onEvent: onClientDeleted 
        ? (data: unknown) => {
            if (typeof data === 'object' && data !== null && 'clientId' in data) {
              const clientId = String((data as { clientId: unknown }).clientId);
              onClientDeleted(clientId);
            }
          }
        : undefined
    }
  ];

  return useWebSocketEvents({
    events,
    onError,
    logPrefix: 'CLIENTS WS'
  });
};

