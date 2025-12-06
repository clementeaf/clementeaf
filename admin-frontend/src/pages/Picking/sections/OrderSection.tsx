import { useState, useMemo, useCallback, useEffect } from 'react';
import { PickingKanbanBoard } from '../components/PickingKanbanBoard';
import type { PickingOrder, PickingOrderStatus } from '../types';
import type { PickingFilters } from '../PickingSidebar';
import { usePickingOrders } from '../../../hooks/usePickingOrders';
import { usePickingOrdersWebSocket } from '../../../hooks/usePickingOrdersWebSocket';

interface OrderSectionProps {
  filters?: PickingFilters;
}

/**
 * Componente de sección de Orden de picking
 * @param props - Props del componente OrderSection
 * @returns Componente OrderSection
 */
export const OrderSection = ({ filters = {} }: OrderSectionProps): React.ReactElement => {
  // Obtener órdenes desde la API
  const { data: ordersData, isLoading, refetch } = usePickingOrders(1, 100);
  const [orders, setOrders] = useState<PickingOrder[]>([]);

  // Actualizar órdenes cuando se cargan desde la API
  useEffect(() => {
    if (ordersData?.data) {
      setOrders(ordersData.data);
    }
  }, [ordersData]);

  /**
   * Maneja la recepción de nuevas órdenes de picking vía WebSocket
   */
  const handleNewOrder = useCallback((newOrder: PickingOrder) => {
    setOrders(prevOrders => {
      // Verificar si la orden ya existe (evitar duplicados)
      const orderExists = prevOrders.some(order => order.id === newOrder.id);
      if (orderExists) {
        console.log(`⚠️ [PICKING] Orden ${newOrder.id} ya existe, ignorando`);
        return prevOrders;
      }

      // Agregar la nueva orden al inicio (más reciente primero)
      console.log(`✅ [PICKING] Nueva orden agregada en tiempo real: ${newOrder.codigoOrden}`);
      
      // La notificación se crea automáticamente en useNotifications hook
      // que escucha el mismo WebSocket
      
      return [newOrder, ...prevOrders];
    });
  }, []);

  /**
   * Hook para escuchar eventos de picking orders vía WebSocket
   */
  usePickingOrdersWebSocket({
    onNewOrder: (order, quoteInfo) => {
      handleNewOrder(order, quoteInfo);
      // Refrescar datos desde la API para asegurar sincronización
      refetch();
    },
    onError: (error) => {
      console.error('❌ [PICKING] Error en WebSocket:', error);
    }
  });

  /**
   * Maneja el cambio de estado de una orden
   */
  const handleStatusChange = (orderId: string, newStatus: PickingOrderStatus): void => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, estado: newStatus } : order
      )
    );
  };

  /**
   * Filtra las órdenes según los filtros aplicados
   * Nota: El filtro por estado no se aplica aquí porque el Kanban organiza por estado
   */
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filtro por vendedor
    if (filters.vendedor) {
      const vendedorLower = filters.vendedor.toLowerCase();
      result = result.filter(order =>
        order.vendedor.toLowerCase().includes(vendedorLower)
      );
    }

    // Filtro por fecha
    if (filters.fechaDesde || filters.fechaHasta) {
      result = result.filter(order => {
        const orderDate = new Date(order.fechaHoraOrden);
        if (filters.fechaDesde) {
          const desde = new Date(filters.fechaDesde);
          desde.setHours(0, 0, 0, 0);
          if (orderDate < desde) return false;
        }
        if (filters.fechaHasta) {
          const hasta = new Date(filters.fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          if (orderDate > hasta) return false;
        }
        return true;
      });
    }

    return result;
  }, [orders, filters]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="flex-1 overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200 p-4 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052C9]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <div className="flex-1 overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200 p-4 h-full">
        <PickingKanbanBoard
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};
