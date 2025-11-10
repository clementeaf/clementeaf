/**
 * Componente para mostrar cuando no hay conversación seleccionada
 * @returns Componente EmptyChat
 */
export const EmptyChat = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <p className="text-lg mb-2">Selecciona una conversación</p>
        <p className="text-sm">Elige un contacto para comenzar a chatear</p>
      </div>
    </div>
  );
};

