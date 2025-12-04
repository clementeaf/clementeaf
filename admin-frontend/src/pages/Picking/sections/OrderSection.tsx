import { useState, useMemo } from 'react';
import { PickingKanbanBoard } from '../components/PickingKanbanBoard';
import type { PickingOrder, PickingOrderStatus } from '../types';
import type { PickingFilters } from '../PickingSidebar';
import { MOCK_PICKING_ORDERS } from './mockData';

interface OrderSectionProps {
  filters?: PickingFilters;
}

/**
 * Componente de sección de Orden de picking
 * @param props - Props del componente OrderSection
 * @returns Componente OrderSection
 */
export const OrderSection = ({ filters = {} }: OrderSectionProps): React.ReactElement => {
  // Datos de ejemplo - En producción esto vendría de un hook/API
  const [orders, setOrders] = useState<PickingOrder[]>(MOCK_PICKING_ORDERS);

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

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <div className="flex-1 overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200 p-4 h-full">
        {filteredOrders.length > 0 ? (
          <PickingKanbanBoard
            orders={filteredOrders}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">
              {orders.length === 0
                ? 'No hay órdenes de picking disponibles'
                : 'No se encontraron órdenes con los filtros aplicados'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

