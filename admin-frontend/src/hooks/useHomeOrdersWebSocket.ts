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
      const wsUrl = `${WSS_ENDPOINT}?userId=${currentUser.id}`;
      console.log(`🔌 [HOME WS] Conectando a: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [HOME WS] WebSocket conectado');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: HomeOrdersWebSocketMessage = JSON.parse(event.data);
          
          if (data.action === 'new_picking_order' && data.pickingOrder) {
            console.log('📦 [HOME WS] Nueva orden recibida:', data.pickingOrder);
            
            // Convertir PickingOrder a HomeOrder
            const homeOrder = convertPickingOrderToHomeOrder(
              data.pickingOrder,
              data.quoteInfo
            );
            
            console.log('🏠 [HOME WS] Orden convertida a HomeOrder:', homeOrder);
            onNewOrder?.(homeOrder);
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
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [currentUser?.id, connect, disconnect]);

  return { disconnect };
};

