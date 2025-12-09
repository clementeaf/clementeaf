import { useEffect, useRef, useCallback } from 'react';
import { useCurrentUser } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://5msg0dgwyi.execute-api.us-east-1.amazonaws.com/dev';

interface TicketsWebSocketMessage {
  action: 'ticket_created' | 'ticket_updated' | 'ticket_status_changed';
  ticketId?: string;
  title?: string;
  type?: string;
  priority?: string;
  estado?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  updatedFields?: string[];
  assigneeId?: number;
}

interface UseTicketsWebSocketOptions {
  onTicketCreated?: () => void;
  onTicketUpdated?: () => void;
  onTicketStatusChanged?: (ticketId: string, estadoAnterior: string, estadoNuevo: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de tickets vía WebSocket
 * @param options - Opciones de configuración
 * @returns Estado de conexión
 */
export const useTicketsWebSocket = (options: UseTicketsWebSocketOptions) => {
  const { onTicketCreated, onTicketUpdated, onTicketStatusChanged, onError } = options;
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isManuallyDisconnected = useRef(false);
  const lastUserIdRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!currentUser?.id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (isManuallyDisconnected.current) return;

    try {
      const token = localStorage.getItem('authToken');
      const wsUrl = token 
        ? `${WSS_ENDPOINT}?token=${encodeURIComponent(token)}&userId=${currentUser.id}`
        : `${WSS_ENDPOINT}?userId=${currentUser.id}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: TicketsWebSocketMessage = JSON.parse(event.data);
          
          if (data.action === 'ticket_created') {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onTicketCreated?.();
          } else if (data.action === 'ticket_updated') {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            if (data.ticketId) {
              queryClient.invalidateQueries({ queryKey: ['ticket', data.ticketId] });
            }
            onTicketUpdated?.();
          } else if (data.action === 'ticket_status_changed' && data.ticketId && data.estadoAnterior && data.estadoNuevo) {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            if (data.ticketId) {
              queryClient.invalidateQueries({ queryKey: ['ticket', data.ticketId] });
            }
            onTicketStatusChanged?.(data.ticketId, data.estadoAnterior, data.estadoNuevo);
          }
        } catch (error) {
          console.error('❌ [TICKETS WS] Error parseando mensaje:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [TICKETS WS] Error en WebSocket:', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = (event) => {
        if (!isManuallyDisconnected.current && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('❌ [TICKETS WS] Error creando WebSocket:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to create WebSocket'));
    }
  }, [currentUser?.id, queryClient, onTicketCreated, onTicketUpdated, onTicketStatusChanged, onError]);

  const disconnect = useCallback(() => {
    isManuallyDisconnected.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    const previousUserId = lastUserIdRef.current;
    
    if (currentUser?.id && currentUser.id !== previousUserId && !isManuallyDisconnected.current) {
      if (previousUserId !== null && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        isManuallyDisconnected.current = true;
        disconnect();
      }
      lastUserIdRef.current = currentUser.id;
      isManuallyDisconnected.current = false;
      connect();
    } else if (!currentUser?.id && previousUserId !== null) {
      lastUserIdRef.current = null;
      isManuallyDisconnected.current = true;
      disconnect();
    } else if (currentUser?.id && currentUser.id === previousUserId && !isManuallyDisconnected.current && wsRef.current?.readyState !== WebSocket.OPEN) {
      connect();
    }

    return () => {
      if (currentUser?.id !== previousUserId && previousUserId !== null && currentUser?.id !== null) {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      } else if (!currentUser?.id && previousUserId !== null) {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      }
    };
  }, [currentUser?.id, connect, disconnect]);

  return { disconnect };
};

