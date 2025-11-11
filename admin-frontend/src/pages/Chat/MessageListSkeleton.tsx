/**
 * Componente skeleton para la lista de mensajes mientras carga
 * @returns Componente MessageListSkeleton
 */
export const MessageListSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="max-w-xs lg:max-w-md">
            <div className={`px-4 py-2 rounded-lg ${index % 2 === 0 ? 'bg-blue-200' : 'bg-gray-200'}`}>
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-full"></div>
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded animate-pulse w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

