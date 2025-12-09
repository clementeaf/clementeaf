import { useWebSocketEvents, type WebSocketEventConfig } from './useWebSocketEvents';

interface UseTicketsWebSocketOptions {
  onTicketCreated?: () => void;
  onTicketUpdated?: () => void;
  onTicketStatusChanged?: (ticketId: string, estadoAnterior: string, estadoNuevo: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de tickets vía WebSocket
 * @param options - Opciones de configuración
 * @returns Función para desconectar manualmente
 */
export const useTicketsWebSocket = (options: UseTicketsWebSocketOptions = {}) => {
  const { onTicketCreated, onTicketUpdated, onTicketStatusChanged, onError } = options;

  const events: WebSocketEventConfig[] = [
    {
      action: 'ticket_created',
      queryKeys: [['tickets']],
      onEvent: onTicketCreated ? () => onTicketCreated() : undefined
    },
    {
      action: 'ticket_updated',
      queryKeys: [['tickets']],
      queryKeysWithId: (id: string) => [['ticket', id]],
      onEvent: onTicketUpdated ? () => onTicketUpdated() : undefined
    },
    {
      action: 'ticket_status_changed',
      queryKeys: [['tickets']],
      queryKeysWithId: (id: string) => [['ticket', id]],
      filter: (data: unknown) => {
        // Solo procesar si tiene todos los campos necesarios
        return typeof data === 'object' && 
               data !== null && 
               'ticketId' in data && 
               'estadoAnterior' in data && 
               'estadoNuevo' in data;
      },
      onEvent: onTicketStatusChanged 
        ? (data: unknown) => {
            if (typeof data === 'object' && data !== null) {
              const ticketData = data as { ticketId?: string; estadoAnterior?: string; estadoNuevo?: string };
              if (ticketData.ticketId && ticketData.estadoAnterior && ticketData.estadoNuevo) {
                onTicketStatusChanged(ticketData.ticketId, ticketData.estadoAnterior, ticketData.estadoNuevo);
              }
            }
          }
        : undefined
    }
  ];

  return useWebSocketEvents({
    events,
    onError,
    logPrefix: 'TICKETS WS'
  });
};

