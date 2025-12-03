import type { HomeOrder, HomeOrderStatus } from '../types';
import { HomeOrderCard } from './HomeOrderCard';

interface HomeKanbanColumnProps {
  title: string;
  status: HomeOrderStatus;
  orders: HomeOrder[];
  onStatusChange: (orderId: string, newStatus: HomeOrderStatus) => void;
}

/**
 * Componente para mostrar una columna en el tablero Kanban del dashboard de inicio
 * @param props - Props del componente HomeKanbanColumn
 * @returns Componente HomeKanbanColumn
 */
export const HomeKanbanColumn = ({ 
  title, 
  orders, 
  onStatusChange 
}: HomeKanbanColumnProps): React.ReactElement => {
  return (
    <div className="flex-1 bg-gray-50 rounded-lg p-3 w-[280px] flex-shrink-0 flex flex-col h-full">
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-800 mb-0.5 break-words">{title}</h2>
        <span className="text-xs text-gray-500">
          {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 min-h-0">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="w-full">
              <HomeOrderCard
                order={order}
                onStatusChange={onStatusChange}
              />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-6 text-xs">
            No hay órdenes
          </div>
        )}
      </div>
    </div>
  );
};

