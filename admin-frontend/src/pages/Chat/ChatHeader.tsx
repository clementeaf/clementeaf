interface ChatHeaderProps {
  name: string;}

/**
 * Componente para mostrar el header del chat con información del contacto
 * @param name - Nombre del contacto
 * @param email - Email del contacto
 * @returns Componente ChatHeader
 */
export const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="p-5 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
    </div>
  );
};

