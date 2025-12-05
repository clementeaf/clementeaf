import type { HomeOrder, HomeOrderStatus } from '../types';
import { HomeKanbanColumn } from './HomeKanbanColumn';

interface HomeKanbanBoardProps {
  orders: HomeOrder[];
  onStatusChange: (orderId: string, newStatus: HomeOrderStatus) => void;
  onDelete?: (orderId: string) => void;
}

/**
 * Configuración de las columnas del tablero Kanban
 */
const columns: Array<{ title: string; status: HomeOrderStatus }> = [
  { title: 'Nota de Venta', status: 'Nota de Venta' },
  { title: 'Picking', status: 'Picking' },
  { title: 'Factura', status: 'Factura' },
  { title: 'Ruta', status: 'Ruta' }
];

/**
 * Componente para mostrar el tablero Kanban de órdenes en el dashboard de inicio
 * @param props - Props del componente HomeKanbanBoard
 * @returns Componente HomeKanbanBoard
 */
export const HomeKanbanBoard = ({ orders, onStatusChange, onDelete }: HomeKanbanBoardProps): React.ReactElement => {
  /**
   * Obtiene las órdenes por estado
   */
  const getOrdersByStatus = (status: HomeOrderStatus): HomeOrder[] => {
    return orders.filter((order) => order.estado === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto h-full">
      {columns.map((column) => (
        <HomeKanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          orders={getOrdersByStatus(column.status)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

