/**
 * Componente skeleton para una columna del Kanban mientras carga
 * @returns Componente KanbanColumnSkeleton
 */
export const KanbanColumnSkeleton = () => {
  return (
    <div className="flex-1 bg-gray-50 rounded-lg p-4 min-w-[280px] flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
          >
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-5/6"></div>
            <div className="flex gap-2 mb-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

