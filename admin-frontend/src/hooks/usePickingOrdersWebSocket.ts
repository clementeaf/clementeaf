import { useEffect, useRef, useCallback } from 'react';
import type { PickingOrder } from '../pages/Picking/types';
import { useCurrentUser } from './useAuth';
import { logger } from '../utils/logger';

const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://5msg0dgwyi.execute-api.us-east-1.amazonaws.com/dev';

interface PickingOrdersWebSocketMessage {
  action: string;
  pickingOrder?: PickingOrder;
  quoteInfo?: {
    clienteNombre?: string;
    monto?: number;
    numeroCotizacion?: string;
    estado?: string;
  };
  quoteId?: string;
  codigoOrden?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  clienteNombre?: string;
}

interface UsePickingOrdersWebSocketOptions {
  onNewOrder?: (order: PickingOrder, quoteInfo?: { clienteNombre?: string; monto?: number; numeroCotizacion?: string; estado?: string }) => void;
  onStatusChange?: (quoteId: string, estadoAnterior: string, estadoNuevo: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de picking orders vía WebSocket
 * @param options - Opciones de configuración
 * @returns Estado de conexión
 */
export const usePickingOrdersWebSocket = (options: UsePickingOrdersWebSocketOptions) => {
  const { onNewOrder, onStatusChange, onError } = options;
  const { data: currentUser } = useCurrentUser();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isManuallyDisconnected = useRef(false);
  const lastUserIdRef = useRef<number | null>(null);

  /**
   * Conecta al WebSocket para escuchar eventos de picking orders
   */
  const connect = useCallback(() => {
    if (!currentUser?.id) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (isManuallyDisconnected.current) {
      return;
    }

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      const wsUrl = token 
        ? `${WSS_ENDPOINT}?token=${encodeURIComponent(token)}&userId=${currentUser.id}`
        : `${WSS_ENDPOINT}?userId=${currentUser.id}`;
      logger.debug(`[PICKING WS] Conectando a: ${wsUrl.replace(/token=[^&]+/, 'token=***')}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info('[PICKING WS] WebSocket conectado');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: PickingOrdersWebSocketMessage = JSON.parse(event.data);
          
          if (data.action === 'new_picking_order' && data.pickingOrder) {
            logger.debug('[PICKING WS] Nueva orden de picking recibida', data.pickingOrder);
            onNewOrder?.(data.pickingOrder, data.quoteInfo);
          } else if (data.action === 'quote_status_changed') {
            logger.debug('[PICKING WS] Estado de quote cambiado', {
              quoteId: data.quoteId,
              estadoAnterior: data.estadoAnterior,
              estadoNuevo: data.estadoNuevo
            });
            if (data.quoteId && data.estadoAnterior && data.estadoNuevo) {
              onStatusChange?.(data.quoteId, data.estadoAnterior, data.estadoNuevo);
            }
          }
        } catch (error) {
          logger.error('[PICKING WS] Error parseando mensaje', error);
        }
      };

      ws.onerror = (error) => {
        logger.error('[PICKING WS] Error en WebSocket', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = (event) => {
        logger.debug(`[PICKING WS] WebSocket cerrado. Code: ${event.code}`);
        
        if (!isManuallyDisconnected.current && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            logger.debug(`[PICKING WS] Reintentando conexión ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, delay);
        }
      };
    } catch (error) {
      logger.error('[PICKING WS] Error creando WebSocket', error);
      onError?.(error instanceof Error ? error : new Error('Failed to create WebSocket'));
    }
  }, [currentUser?.id, onNewOrder, onError]);

  /**
   * Desconecta del WebSocket
   */
  const disconnect = useCallback(() => {
    isManuallyDisconnected.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      // Solo cerrar si el WebSocket está en un estado válido para cerrar
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    const previousUserId = lastUserIdRef.current;
    
    // Solo conectar si hay userId y cambió desde la última vez
    if (currentUser?.id && currentUser.id !== previousUserId && !isManuallyDisconnected.current) {
      logger.debug(`[PICKING WS] userId cambió de ${previousUserId} a ${currentUser.id}, reconectando...`);
      // Desconectar la conexión anterior si existe y está abierta
      if (previousUserId !== null && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        logger.debug(`[PICKING WS] Desconectando conexión anterior para userId ${previousUserId}...`);
        isManuallyDisconnected.current = true;
        disconnect();
      }
      // Actualizar el userId y conectar
      lastUserIdRef.current = currentUser.id;
      isManuallyDisconnected.current = false;
      connect();
    } else if (!currentUser?.id && previousUserId !== null) {
      // Si userId se vuelve null, desconectar
      logger.debug('[PICKING WS] userId se volvió null, desconectando...');
      lastUserIdRef.current = null;
      isManuallyDisconnected.current = true;
      disconnect();
    } else if (currentUser?.id && currentUser.id === previousUserId && !isManuallyDisconnected.current && wsRef.current?.readyState !== WebSocket.OPEN) {
      // Si userId es el mismo pero no hay conexión, conectar
      logger.debug(`[PICKING WS] userId es el mismo (${currentUser.id}) pero no hay conexión, conectando...`);
      connect();
    }

    return () => {
      // Solo desconectar en el cleanup si:
      // 1. El userId realmente cambió (no de null a un valor, sino de un valor a otro diferente)
      // 2. Y hay una conexión establecida (OPEN)
      // Esto evita desconectar durante React Strict Mode cuando el WebSocket aún no se ha conectado
      // o cuando es la primera conexión (null -> userId)
      if (currentUser?.id !== previousUserId && previousUserId !== null && currentUser?.id !== null && currentUser) {
        // userId cambió de un valor a otro (no es la primera conexión)
        logger.debug(`[PICKING WS] Cleanup: userId cambió de ${previousUserId} a ${currentUser.id}, desconectando...`);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      } else if (!currentUser?.id && previousUserId !== null) {
        // userId se volvió null
        logger.debug('[PICKING WS] Cleanup: userId se volvió null, desconectando...');
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      }
      // No desconectar si userId cambió de null a un valor (primera conexión)
      // porque el WebSocket aún no se ha conectado y React Strict Mode ejecuta el cleanup inmediatamente
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Justificación: No incluir connect/disconnect en deps para evitar loops infinitos.
    // Estos callbacks son estables (useCallback) y solo dependen de refs.
    // Incluir onNewOrder, onStatusChange, onError causaría reconexiones innecesarias.
  }, [currentUser?.id, onNewOrder, onStatusChange, onError]);

  return { disconnect };
};

