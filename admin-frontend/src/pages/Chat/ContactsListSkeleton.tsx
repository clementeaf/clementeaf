/**
 * Componente skeleton para la lista de contactos mientras carga
 * @returns Componente ContactsListSkeleton
 */
export const ContactsListSkeleton = () => {
  return (
    <div className="divide-y divide-gray-200">
      {[1, 2, 3, 4, 5].map((index) => (
        <div key={index} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

