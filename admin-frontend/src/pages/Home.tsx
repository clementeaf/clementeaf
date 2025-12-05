import { useState } from 'react';
import { HomeKanbanBoard } from './Home/components';
import type { HomeOrder, HomeOrderStatus } from './Home/types';

/**
 * Página de inicio
 * @returns Componente Home
 */
export const Home = (): React.ReactElement => {
  const [orders, setOrders] = useState<HomeOrder[]>([]);

  /**
   * Maneja el cambio de estado de una orden
   */
  const handleStatusChange = (orderId: string, newStatus: HomeOrderStatus): void => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, estado: newStatus } : order
      )
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-8">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200 p-4 h-full">
          {orders.length > 0 ? (
            <HomeKanbanBoard
              orders={orders}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">No hay órdenes disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

