import { useState, useEffect, useCallback } from 'react';
import { HomeKanbanBoard } from './Home/components';
import type { HomeOrder, HomeOrderStatus } from './Home/types';
import { useHomeOrders } from '../hooks/useHomeOrders';
import { useHomeOrdersWebSocket } from '../hooks/useHomeOrdersWebSocket';

/**
 * Página de inicio
 * @returns Componente Home
 */
export const Home = (): React.ReactElement => {
  // Obtener órdenes desde la API
  const { data: ordersData, isLoading } = useHomeOrders(1, 100);
  const [orders, setOrders] = useState<HomeOrder[]>([]);

  // Actualizar órdenes cuando se cargan desde la API
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  /**
   * Maneja la recepción de nuevas órdenes vía WebSocket
   */
  const handleNewOrder = useCallback((newOrder: HomeOrder) => {
    setOrders(prevOrders => {
      // Verificar si la orden ya existe (evitar duplicados)
      const orderExists = prevOrders.some(order => order.id === newOrder.id);
      if (orderExists) {
        console.log(`⚠️ [HOME] Orden ${newOrder.id} ya existe, ignorando`);
        return prevOrders;
      }

      // Agregar la nueva orden al inicio (más reciente primero)
      console.log(`✅ [HOME] Nueva orden agregada en tiempo real: ${newOrder.codigoOrden}`);
      return [newOrder, ...prevOrders];
    });
  }, []);

  /**
   * Hook para escuchar eventos de home orders vía WebSocket
   */
  useHomeOrdersWebSocket({
    onNewOrder: handleNewOrder,
    onError: (error) => {
      console.error('❌ [HOME] Error en WebSocket:', error);
    }
  });

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
          <HomeKanbanBoard
            orders={orders}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

