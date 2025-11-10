import { type ChangeEvent, type KeyboardEvent } from 'react';
import { Button, Input } from '../../components/commons';

interface MessageInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isSending: boolean;
}

/**
 * Componente para el input de mensajes
 * @param value - Valor del input
 * @param onChange - Función que se ejecuta al cambiar el valor
 * @param onSend - Función que se ejecuta al enviar el mensaje
 * @param isSending - Indica si se está enviando el mensaje
 * @returns Componente MessageInput
 */
export const MessageInput = ({ value, onChange, onSend, isSending }: MessageInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 flex gap-2 w-full">
      <Input
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        containerClassName="w-full"
      />
      <Button onClick={onSend} disabled={!value.trim() || isSending}>
        {isSending ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );
};

