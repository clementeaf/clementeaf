/**
 * Página de Chat
 * @returns Componente Chat
 */
export const Chat = () => {
  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex">
        {/* Sección de Contactos */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Contactos</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Contenido de contactos */}
          </div>
        </div>

        {/* Sección de Chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Contenido de chat */}
          </div>
        </div>
      </div>
    </div>
  );
};

