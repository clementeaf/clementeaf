import { useState, useMemo, useCallback, useEffect } from 'react';
import { PickingKanbanBoard } from '../components/PickingKanbanBoard';
import type { PickingOrder, PickingOrderStatus } from '../types';
import type { PickingFilters } from '../PickingSidebar';
import { usePickingOrders } from '../../../hooks/usePickingOrders';
import { usePickingOrdersWebSocket } from '../../../hooks/usePickingOrdersWebSocket';
import { useUpdateQuote } from '../../../hooks/useQuotes';
import { toast } from 'react-toastify';
import { logger } from '../../../utils/logger';

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
  const updateQuoteMutation = useUpdateQuote();

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
        logger.debug(`[PICKING] Orden ${newOrder.id} ya existe, ignorando`);
        return prevOrders;
      }

      // Agregar la nueva orden al inicio (más reciente primero)
      logger.debug(`[PICKING] Nueva orden agregada en tiempo real: ${newOrder.codigoOrden}`);
      
      // La notificación se crea automáticamente en useNotifications hook
      // que escucha el mismo WebSocket
      
      return [newOrder, ...prevOrders];
    });
  }, []);

  /**
   * Maneja el cambio de estado recibido desde WebSocket
   */
  const handleStatusChangeFromWebSocket = useCallback((quoteId: string, estadoAnterior: string, estadoNuevo: string): void => {
    // Actualizar la orden localmente cuando se recibe un cambio de estado desde WebSocket
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === quoteId) {
          logger.debug(`[PICKING] Actualizando orden ${order.codigoOrden} desde WebSocket: ${estadoAnterior} → ${estadoNuevo}`);
          return { ...order, estado: estadoNuevo as PickingOrderStatus };
        }
        return order;
      })
    );
  }, []);

  /**
   * Hook para escuchar eventos de picking orders vía WebSocket
   */
  usePickingOrdersWebSocket({
    onNewOrder: (order) => {
      handleNewOrder(order);
      // Refrescar datos desde la API para asegurar sincronización
      refetch();
    },
    onStatusChange: handleStatusChangeFromWebSocket,
    onError: (error) => {
      logger.error('[PICKING] Error en WebSocket', error);
    }
  });

  /**
   * Mapea el estado de picking al estado de quote
   */
  const mapPickingStatusToQuoteStatus = (status: PickingOrderStatus): string => {
    const statusMap: Record<PickingOrderStatus, string> = {
      'Nota de venta emitida': 'Nota de venta emitida',
      'Picking': 'Picking',
      'Confirmación': 'Confirmación',
      'Despachado': 'Despachado'
    };
    return statusMap[status] || status;
  };

  /**
   * Maneja el cambio de estado de una orden
   */
  const handleStatusChange = useCallback(async (orderId: string, newStatus: PickingOrderStatus): Promise<void> => {
    // Actualización optimista en el frontend
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, estado: newStatus } : order
      )
    );

    // Actualizar en el backend
    try {
      const quoteId = parseInt(orderId, 10);
      if (isNaN(quoteId)) {
        logger.error('[PICKING] ID de orden inválido', { orderId });
        toast.error('Error: ID de orden inválido');
        // Revertir cambio optimista
        refetch();
        return;
      }

      const quoteStatus = mapPickingStatusToQuoteStatus(newStatus);
      await updateQuoteMutation.mutateAsync({
        id: quoteId,
        data: { estado: quoteStatus }
      });

      toast.success(`Orden actualizada a: ${newStatus}`);
    } catch (error) {
      logger.error('[PICKING] Error actualizando estado', error);
      toast.error('Error al actualizar el estado de la orden');
      // Revertir cambio optimista
      refetch();
    }
  }, [updateQuoteMutation, refetch]);

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
