import { useMemo, useState, useEffect, useCallback } from 'react';
import { HomeKanbanBoard } from './Home/components';
import type { HomeOrder, HomeOrderStatus } from './Home/types';
import { useHomeOrders } from '../hooks/useHomeOrders';
import { useHomeOrdersWebSocket } from '../hooks/useHomeOrdersWebSocket';
import { homeOrdersService } from '../services/homeOrdersService';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-toastify';
import { logger } from '../utils/logger';
import { Button } from '../components/commons';
import { DataTablePage } from '../components/commons/DataTablePage';
import { getHomeOrdersColumns, type HomeOrdersTableActions } from './Home/columns';
import { HomeOrderDetailModal } from './Home/components/HomeOrderDetailModal';

type HomeViewMode = 'kanban' | 'table';

/**
 * Página de inicio
 * @returns Componente Home
 */
export const Home = (): React.ReactElement => {
  // Obtener órdenes desde la API
  const { data: ordersData, refetch } = useHomeOrders({ page: 1, limit: 100 });
  const [orders, setOrders] = useState<HomeOrder[]>([]);
  const { createSalesNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<HomeViewMode>('kanban');
  const [selectedOrder, setSelectedOrder] = useState<HomeOrder | null>(null);

  // Actualizar órdenes cuando se cargan desde la API
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  /**
   * Maneja el cambio de estado recibido desde WebSocket
   */
  const handleStatusChangeFromWebSocket = useCallback((quoteId: string, estadoAnterior: string, estadoNuevo: string): void => {
    // Actualizar la orden localmente cuando se recibe un cambio de estado desde WebSocket
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === quoteId) {
          logger.debug(`[HOME] Actualizando orden ${order.codigoOrden} desde WebSocket: ${estadoAnterior} → ${estadoNuevo}`);
          return { ...order, estado: estadoNuevo as HomeOrderStatus };
        }
        return order;
      })
    );
  }, []);

  /**
   * Maneja la recepción de nuevas órdenes vía WebSocket
   */
  const handleNewOrder = useCallback((newOrder: HomeOrder) => {
    setOrders(prevOrders => {
      // Verificar si la orden ya existe (evitar duplicados)
      const orderExists = prevOrders.some(order => order.id === newOrder.id);
      if (orderExists) {
        logger.debug(`[HOME] Orden ${newOrder.id} ya existe, ignorando`);
        return prevOrders;
      }

      // Agregar la nueva orden al inicio (más reciente primero)
      logger.debug(`[HOME] Nueva orden agregada en tiempo real: ${newOrder.codigoOrden}`);
      return [newOrder, ...prevOrders];
    });
  }, []);

  /**
   * Hook para escuchar eventos de home orders vía WebSocket
   */
  useHomeOrdersWebSocket({
    onNewOrder: (order) => {
      handleNewOrder(order);
      // Refrescar datos desde la API para asegurar sincronización
      refetch();
    },
    onStatusChange: handleStatusChangeFromWebSocket,
    onError: (error) => {
      logger.error('[HOME] Error en WebSocket', error);
    }
  });

  /**
   * Maneja el cambio de estado de una orden
   */
  const handleStatusChange = (orderId: string, newStatus: HomeOrderStatus): void => {
    setOrders(prevOrders => {
      const order = prevOrders.find(o => o.id === orderId);
      if (!order) return prevOrders;

      // Crear notificación de cambio de estado para Ventas
      if (order.estado !== newStatus) {
        const estadoAnterior = order.estado;
        createSalesNotification(
          orderId,
          order.codigoOrden,
          estadoAnterior,
          newStatus,
          order.cliente
        );
      }

      return prevOrders.map(o =>
        o.id === orderId ? { ...o, estado: newStatus } : o
      );
    });
  };

  /**
   * Maneja la eliminación de una nota de venta
   */
  const handleDelete = useCallback(async (orderId: string): Promise<void> => {
    try {
      await homeOrdersService.deleteHomeOrder(orderId);
      
      // Remover la orden del estado local
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      toast.success('Nota de venta eliminada exitosamente');
    } catch (error) {
      logger.error('Error eliminando nota de venta', error);
      toast.error('Error al eliminar la nota de venta');
    }
  }, []);

  /**
   * Acciones para vista tabla.
   */
  const tableActions = useMemo<HomeOrdersTableActions>(() => {
    return {
      onViewDetails: (order: HomeOrder): void => setSelectedOrder(order),
      onDelete: handleDelete
    };
  }, [handleDelete]);

  return (
    <div className="w-full h-full flex flex-col p-8">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-900">Inicio</div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban'
                ? 'bg-[#0052C9] text-white hover:bg-[#004BB7] text-xs px-3 py-2'
                : 'bg-white text-[#0052C9] border border-[#0052C9] hover:bg-[#EAF2FF] text-xs px-3 py-2'}
            >
              Kanban
            </Button>
            <Button
              type="button"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table'
                ? 'bg-[#0052C9] text-white hover:bg-[#004BB7] text-xs px-3 py-2'
                : 'bg-white text-[#0052C9] border border-[#0052C9] hover:bg-[#EAF2FF] text-xs px-3 py-2'}
            >
              Tabla
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200 p-4 h-full">
          {viewMode === 'kanban' ? (
            <HomeKanbanBoard
              orders={orders}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ) : (
            <div className="h-full">
              <DataTablePage<HomeOrder>
                data={orders}
                columns={getHomeOrdersColumns(tableActions)}
                isLoading={false}
                error={null}
                errorMessage="Error al cargar órdenes"
                onRowClick={(row) => setSelectedOrder(row.original)}
                tableContainerClassName="h-full p-0 border-0 shadow-none"
              />
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <HomeOrderDetailModal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

