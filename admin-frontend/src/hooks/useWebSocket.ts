import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '../services/chatService';

const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://ao9gv2kwll.execute-api.us-east-1.amazonaws.com/dev';

interface WebSocketMessage {
  action: string;
  message?: Message;
  conversationId?: number;
  userId?: number;
  isTyping?: boolean;
}

interface UseWebSocketOptions {
  userId: number | null;
  onMessage?: (message: Message) => void;
  onTyping?: (data: { conversationId: number; userId: number; isTyping: boolean }) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Hook para gestionar conexión WebSocket
 * @param options - Opciones de configuración del WebSocket
 * @returns Estado y funciones del WebSocket
 */
export const useWebSocket = (options: UseWebSocketOptions) => {
  const { userId, onMessage, onTyping, onError, onConnect, onDisconnect } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isManuallyDisconnected = useRef(false);
  const lastUserIdRef = useRef<number | null>(null);

  /**
   * Conecta al WebSocket
   */
  const connect = useCallback(() => {
    if (!userId) {
      console.log('⚠️ useWebSocket - No userId provided, skipping connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('ℹ️ useWebSocket - WebSocket already connected');
      return;
    }

    if (isManuallyDisconnected.current) {
      console.log('ℹ️ useWebSocket - Connection was manually disconnected, skipping auto-reconnect');
      return;
    }

    try {
      const wsUrl = `${WSS_ENDPOINT}?userId=${userId}`;
      console.log(`🔌 useWebSocket - Connecting to: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ useWebSocket - WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.action === 'newMessage' && data.message) {
            onMessage?.(data.message);
          } else if (data.action === 'typing' && data.conversationId !== undefined && data.userId !== undefined && data.isTyping !== undefined) {
            onTyping?.({
              conversationId: data.conversationId,
              userId: data.userId,
              isTyping: data.isTyping
            });
          }
        } catch (error) {
          console.error('❌ useWebSocket - Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ useWebSocket - WebSocket error:', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = (event) => {
        console.log(`🔌 useWebSocket - WebSocket closed. Code: ${event.code}, Reason: ${event.reason}, WasClean: ${event.wasClean}`);
        setIsConnected(false);
        onDisconnect?.();

        // Solo reconectar si no fue desconexión manual y no excedimos los intentos
        if (!isManuallyDisconnected.current && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000); // Backoff exponencial, máximo 30s
          console.log(`🔄 useWebSocket - Attempting reconnect ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error(`❌ useWebSocket - Max reconnect attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`);
        }
      };
    } catch (error) {
      console.error('❌ useWebSocket - Error creating WebSocket:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to create WebSocket'));
    }
  }, [userId, onMessage, onTyping, onError, onConnect, onDisconnect]);

  /**
   * Desconecta del WebSocket
   */
  const disconnect = useCallback(() => {
    console.log('🔌 useWebSocket - Manually disconnecting...');
    isManuallyDisconnected.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    const previousUserId = lastUserIdRef.current;
    
    // Solo conectar si hay userId y cambió desde la última vez
    if (userId && userId !== previousUserId && !isManuallyDisconnected.current) {
      console.log(`🔄 useWebSocket - userId cambió de ${previousUserId} a ${userId}, reconectando...`);
      // Desconectar la conexión anterior si existe y está abierta
      if (previousUserId !== null && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log(`🔌 useWebSocket - Desconectando conexión anterior para userId ${previousUserId}...`);
        isManuallyDisconnected.current = true;
        disconnect();
      }
      // Actualizar el userId y conectar
      lastUserIdRef.current = userId;
      isManuallyDisconnected.current = false;
      connect();
    } else if (!userId && previousUserId !== null) {
      // Si userId se vuelve null, desconectar
      console.log(`🔌 useWebSocket - userId se volvió null, desconectando...`);
      lastUserIdRef.current = null;
      isManuallyDisconnected.current = true;
      disconnect();
    } else if (userId && userId === previousUserId && !isManuallyDisconnected.current && wsRef.current?.readyState !== WebSocket.OPEN) {
      // Si userId es el mismo pero no hay conexión, conectar
      console.log(`🔌 useWebSocket - userId es el mismo (${userId}) pero no hay conexión, conectando...`);
      connect();
    }

    return () => {
      // Solo desconectar en el cleanup si:
      // 1. El userId realmente cambió (no de null a un valor, sino de un valor a otro diferente)
      // 2. Y hay una conexión establecida (OPEN)
      // Esto evita desconectar durante React Strict Mode cuando el WebSocket aún no se ha conectado
      // o cuando es la primera conexión (null -> userId)
      if (userId !== previousUserId && previousUserId !== null && userId !== null) {
        // userId cambió de un valor a otro (no es la primera conexión)
        console.log(`🔌 useWebSocket - Cleanup: userId cambió de ${previousUserId} a ${userId}, desconectando...`);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      } else if (userId === null && previousUserId !== null) {
        // userId se volvió null
        console.log(`🔌 useWebSocket - Cleanup: userId se volvió null, desconectando...`);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          isManuallyDisconnected.current = true;
          disconnect();
        }
      }
      // No desconectar si userId cambió de null a un valor (primera conexión)
      // porque el WebSocket aún no se ha conectado y React Strict Mode ejecuta el cleanup inmediatamente
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Solo dependemos de userId, no de connect/disconnect

  return {
    isConnected,
    connect,
    disconnect
  };
};

