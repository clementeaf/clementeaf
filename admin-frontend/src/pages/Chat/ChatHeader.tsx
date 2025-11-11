interface ChatHeaderProps {
  name: string;
  isTyping?: boolean;
}

/**
 * Componente para mostrar el header del chat con información del contacto
 * @param name - Nombre del contacto
 * @param isTyping - Indica si el contacto está escribiendo
 * @returns Componente ChatHeader
 */
export const ChatHeader = ({ name, isTyping = false }: ChatHeaderProps) => {
  return (
    <div className="p-5 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
      {isTyping && (
        <p className="text-sm text-gray-500 italic mt-1">escribiendo...</p>
      )}
    </div>
  );
};

