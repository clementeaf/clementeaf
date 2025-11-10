import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '../services/chatService';

const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev';

interface WebSocketMessage {
  action: string;
  message?: Message;
}

interface UseWebSocketOptions {
  userId: number | null;
  onMessage?: (message: Message) => void;
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
  const { userId, onMessage, onError, onConnect, onDisconnect } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  /**
   * Conecta al WebSocket
   */
  const connect = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`${WSS_ENDPOINT}?userId=${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.action === 'newMessage' && data.message) {
            onMessage?.(data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 1000 * reconnectAttempts.current);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to create WebSocket'));
    }
  }, [userId, onMessage, onError, onConnect, onDisconnect]);

  /**
   * Desconecta del WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect
  };
};

