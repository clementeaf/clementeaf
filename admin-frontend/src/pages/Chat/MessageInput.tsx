import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useCallback } from 'react';
import { Button, Input } from '../../components/commons';
import { chatService } from '../../services/chatService';

interface MessageInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isSending: boolean;
  conversationId: number | null;
  userId: number | null;
}

/**
 * Componente para el input de mensajes con detección de typing
 * @param value - Valor del input
 * @param onChange - Función que se ejecuta al cambiar el valor
 * @param onSend - Función que se ejecuta al enviar el mensaje
 * @param isSending - Indica si se está enviando el mensaje
 * @param conversationId - ID de la conversación actual
 * @param userId - ID del usuario actual
 * @returns Componente MessageInput
 */
export const MessageInput = ({ 
  value, 
  onChange, 
  onSend, 
  isSending,
  conversationId,
  userId
}: MessageInputProps) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingTimeRef = useRef<number>(0);
  const isTypingRef = useRef<boolean>(false);

  /**
   * Inicia el indicador de typing
   */
  const startTyping = useCallback(async () => {
    if (!conversationId || !userId || isTypingRef.current) return;

    const now = Date.now();
    if (now - lastTypingTimeRef.current < 1000) {
      return;
    }

    lastTypingTimeRef.current = now;
    isTypingRef.current = true;

    try {
      await chatService.startTyping(conversationId, userId);
    } catch (error) {
      console.error('Error iniciando typing:', error);
    }
  }, [conversationId, userId]);

  /**
   * Detiene el indicador de typing
   */
  const stopTyping = useCallback(async () => {
    if (!conversationId || !userId || !isTypingRef.current) return;

    isTypingRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    try {
      await chatService.stopTyping(conversationId, userId);
    } catch (error) {
      console.error('Error deteniendo typing:', error);
    }
  }, [conversationId, userId]);

  /**
   * Maneja el cambio de valor del input
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange(e);

    if (!conversationId || !userId) return;

    // Iniciar typing si hay contenido
    if (e.target.value.trim().length > 0) {
      startTyping();

      // Detener typing después de 3 segundos de inactividad
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    } else {
      // Detener typing si el input está vacío
      stopTyping();
    }
  };

  /**
   * Maneja el envío del mensaje
   */
  const handleSend = (): void => {
    stopTyping();
    onSend();
  };

  /**
   * Maneja las teclas presionadas
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Limpiar typing al desmontar o cambiar de conversación
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        stopTyping();
      }
    };
  }, [stopTyping]);

  // Detener typing cuando se envía el mensaje
  useEffect(() => {
    if (!isSending && value.trim().length === 0) {
      stopTyping();
    }
  }, [isSending, value, stopTyping]);

  return (
    <div className="p-4 border-t border-gray-200 flex gap-2 w-full">
      <Input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        containerClassName="w-full"
      />
      <Button onClick={handleSend} disabled={!value.trim() || isSending}>
        {isSending ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );
};

