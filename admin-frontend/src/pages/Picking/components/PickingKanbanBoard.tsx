import type { PickingOrder, PickingOrderStatus } from '../types';
import { PickingKanbanColumn } from './PickingKanbanColumn';

interface PickingKanbanBoardProps {
  orders: PickingOrder[];
  onStatusChange: (orderId: string, newStatus: PickingOrderStatus) => void;
}

/**
 * Configuración de las columnas del tablero Kanban
 */
const columns: Array<{ title: string; status: PickingOrderStatus }> = [
  { title: 'Solicitud venta', status: 'Solicitud venta' },
  { title: 'Picking', status: 'Picking' },
  { title: 'Confirmación', status: 'Confirmación' },
  { title: 'Despachado', status: 'Despachado' }
];

/**
 * Componente para mostrar el tablero Kanban de órdenes de picking
 * @param props - Props del componente PickingKanbanBoard
 * @returns Componente PickingKanbanBoard
 */
export const PickingKanbanBoard = ({ orders, onStatusChange }: PickingKanbanBoardProps): React.ReactElement => {
  /**
   * Obtiene las órdenes por estado
   */
  const getOrdersByStatus = (status: PickingOrderStatus): PickingOrder[] => {
    return orders.filter((order) => order.estado === status);
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto">
      {columns.map((column) => (
        <PickingKanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          orders={getOrdersByStatus(column.status)}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

