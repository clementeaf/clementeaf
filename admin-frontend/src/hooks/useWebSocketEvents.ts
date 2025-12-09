import { useEffect, useRef, useCallback } from 'react';
import { useCurrentUser } from './useAuth';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://5msg0dgwyi.execute-api.us-east-1.amazonaws.com/dev';

/**
 * Configuración para un evento WebSocket
 */
export interface WebSocketEventConfig {
  /**
   * Acción del evento (ej: 'quote_created', 'client_updated')
   */
  action: string;
  /**
   * Query keys a invalidar cuando ocurre este evento
   */
  queryKeys: QueryKey[];
  /**
   * Query keys adicionales a invalidar si hay un ID específico en el mensaje
   */
  queryKeysWithId?: (id: string) => QueryKey[];
  /**
   * Callback opcional cuando ocurre el evento
   */
  onEvent?: (data: unknown) => void;
  /**
   * Función para filtrar mensajes (opcional)
   * Retorna true si el mensaje debe procesarse
   */
  filter?: (data: unknown) => boolean;
}

/**
 * Opciones para el hook useWebSocketEvents
 */
export interface UseWebSocketEventsOptions {
  /**
   * Configuraciones de eventos a escuchar
   */
  events: WebSocketEventConfig[];
  /**
   * Callback opcional para errores
   */
  onError?: (error: Error) => void;
  /**
   * Prefijo para logs (opcional)
   */
  logPrefix?: string;
}

/**
 * Hook base para escuchar eventos WebSocket genéricos
 * Elimina duplicación de código entre hooks WebSocket específicos
 * @param options - Opciones de configuración
 * @returns Función para desconectar manualmente
 */
export const useWebSocketEvents = (options: UseWebSocketEventsOptions) => {
  const { events, onError, logPrefix = 'WS' } = options;
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
          const data: unknown = JSON.parse(event.data);
          
          // Procesar cada configuración de evento
          for (const eventConfig of events) {
            // Verificar si el mensaje tiene la acción esperada
            if (typeof data === 'object' && data !== null && 'action' in data) {
              const messageAction = (data as { action: string }).action;
              
              if (messageAction === eventConfig.action) {
                // Aplicar filtro si existe
                if (eventConfig.filter && !eventConfig.filter(data)) {
                  continue;
                }
                
                // Invalidar queries
                for (const queryKey of eventConfig.queryKeys) {
                  queryClient.invalidateQueries({ queryKey });
                }
                
                // Invalidar queries con ID si existe
                if (eventConfig.queryKeysWithId && typeof data === 'object' && data !== null) {
                  // Intentar extraer ID del mensaje (puede estar en diferentes campos)
                  const idFields = ['id', 'quoteId', 'clientId', 'branchId', 'ticketId', 'productId', 'movementId'];
                  for (const idField of idFields) {
                    if (idField in data) {
                      const id = String((data as Record<string, unknown>)[idField]);
                      const idQueryKeys = eventConfig.queryKeysWithId(id);
                      for (const queryKey of idQueryKeys) {
                        queryClient.invalidateQueries({ queryKey });
                      }
                      break;
                    }
                  }
                }
                
                // Ejecutar callback si existe
                eventConfig.onEvent?.(data);
              }
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`❌ [${logPrefix}] Error parseando mensaje:`, error);
          }
        }
      };

      ws.onerror = (error) => {
        if (import.meta.env.DEV) {
          console.error(`❌ [${logPrefix}] Error en WebSocket:`, error);
        }
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        if (!isManuallyDisconnected.current && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`❌ [${logPrefix}] Error creando WebSocket:`, error);
      }
      onError?.(error instanceof Error ? error : new Error('Failed to create WebSocket'));
    }
  }, [currentUser?.id, queryClient, events, onError, logPrefix]);

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

