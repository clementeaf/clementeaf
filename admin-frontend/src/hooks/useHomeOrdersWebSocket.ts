import { useEffect, useRef, useCallback } from 'react';
import type { PickingOrder } from '../pages/Picking/types';
import type { HomeOrder } from '../pages/Home/types';
import { useCurrentUser } from './useAuth';
import { convertPickingOrderToHomeOrder } from '../services/homeOrdersService';

const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://5msg0dgwyi.execute-api.us-east-1.amazonaws.com/dev';

interface HomeOrdersWebSocketMessage {
  action: string;
  pickingOrder?: PickingOrder;
  quoteInfo?: {
    clienteNombre?: string;
    monto?: number;
    numeroCotizacion?: string;
    estado?: string;
  };
}

interface UseHomeOrdersWebSocketOptions {
  onNewOrder?: (order: HomeOrder) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de home orders vía WebSocket
 * Convierte automáticamente PickingOrder a HomeOrder
 * @param options - Opciones de configuración
 * @returns Estado de conexión
 */
export const useHomeOrdersWebSocket = (options: UseHomeOrdersWebSocketOptions) => {
  const { onNewOrder, onError } = options;
  const { data: currentUser } = useCurrentUser();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isManuallyDisconnected = useRef(false);
  const lastUserIdRef = useRef<number | null>(null);

  /**
   * Conecta al WebSocket para escuchar eventos de home orders
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
      console.log(`🔌 [HOME WS] Conectando a: ${wsUrl.replace(/token=[^&]+/, 'token=***')}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [HOME WS] WebSocket conectado');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: HomeOrdersWebSocketMessage = JSON.parse(event.data);
          
          if (data.action === 'new_picking_order' && data.pickingOrder && data.quoteInfo) {
            console.log('📦 [HOME WS] Nueva orden recibida:', data.pickingOrder);
            
            // Convertir PickingOrder a HomeOrder
            const homeOrder = convertPickingOrderToHomeOrder(
              data.pickingOrder,
              data.quoteInfo
            );
            
            console.log('🏠 [HOME WS] Orden convertida a HomeOrder:', homeOrder);
            onNewOrder?.(homeOrder);
          } else if (data.action === 'quote_status_changed') {
            // Refrescar cuando cambia el estado de una quote
            console.log('🔄 [HOME WS] Estado de quote cambiado, refrescando...');
            // El hook useHomeOrders se encargará de refrescar automáticamente
          }
        } catch (error) {
          console.error('❌ [HOME WS] Error parseando mensaje:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [HOME WS] Error en WebSocket:', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = (event) => {
        console.log(`🔌 [HOME WS] WebSocket cerrado. Code: ${event.code}`);
        
        if (!isManuallyDisconnected.current && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 [HOME WS] Reintentando conexión ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('❌ [HOME WS] Error creando WebSocket:', error);
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
      console.log(`🔄 [HOME WS] userId cambió de ${previousUserId} a ${currentUser.id}, reconectando...`);
      // Desconectar la conexión anterior si existe y está abierta
      if (previousUserId !== null && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log(`🔌 [HOME WS] Desconectando conexión anterior para userId ${previousUserId}...`);
        isManuallyDisconnected.current = true;
        disconnect();
      }
      // Actualizar el userId y conectar
      lastUserIdRef.current = currentUser.id;
      isManuallyDisconnected.current = false;
      connect();
    } else if (!currentUser?.id && previousUserId !== null) {
      // Si userId se vuelve null, desconectar
      console.log(`🔌 [HOME WS] userId se volvió null, desconectando...`);
      lastUserIdRef.current = null;
      isManuallyDisconnected.current = true;
      disconnect();
    } else if (currentUser?.id && currentUser.id === previousUserId && !isManuallyDisconnected.current && wsRef.current?.readyState !== WebSocket.OPEN) {
      // Si userId es el mismo pero no hay conexión, conectar
      console.log(`🔌 [HOME WS] userId es el mismo (${currentUser.id}) pero no hay conexión, conectando...`);
      connect();
    }

    return () => {
      // Solo desconectar en el cleanup si:
      // 1. El userId realmente cambió (no de null a un valor, sino de un valor a otro diferente)
      // 2. Y hay una conexión establecida (OPEN)
      // Esto evita desconectar durante React Strict Mode cuando el WebSocket aún no se ha conectado
      // o cuando es la primera conexión (null -> userId)
      if (currentUser?.id !== previousUserId && previousUserId !== null && currentUser?.id !== null) {
        // userId cambió de un valor a otro (no es la primera conexión)
        console.log(`🔌 [HOME WS] Cleanup: userId cambió de ${previousUserId} a ${currentUser.id}, desconectando...`);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      } else if (!currentUser?.id && previousUserId !== null) {
        // userId se volvió null
        console.log(`🔌 [HOME WS] Cleanup: userId se volvió null, desconectando...`);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      }
      // No desconectar si userId cambió de null a un valor (primera conexión)
      // porque el WebSocket aún no se ha conectado y React Strict Mode ejecuta el cleanup inmediatamente
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]); // Solo dependemos de currentUser?.id, no de connect/disconnect

  return { disconnect };
};

