import { useState, useMemo, useCallback, useEffect } from 'react';
import { PickingKanbanBoard } from '../components/PickingKanbanBoard';
import type { PickingOrder, PickingOrderStatus } from '../types';
import type { PickingFilters } from '../PickingSidebar';
import { usePickingOrders } from '../../../hooks/usePickingOrders';
import { usePickingOrdersWebSocket } from '../../../hooks/usePickingOrdersWebSocket';
import { quotesService, type PickingStatus } from '../../../services/quotesService';
import { toast } from 'react-toastify';
import { logger } from '../../../utils/logger';

/**
 * Extrae un mensaje de error legible desde errores de Axios u objetos genéricos.
 * @param error - Error capturado
 * @returns Mensaje para UI
 */
const getReadableErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const maybeAxios = error as { response?: { data?: unknown; status?: number } };
    const data = maybeAxios.response?.data;
    if (data && typeof data === 'object') {
      const d = data as { message?: unknown; error?: unknown };
      if (typeof d.message === 'string' && d.message.trim().length > 0) return d.message;
      if (typeof d.error === 'string' && d.error.trim().length > 0) return d.error;
    }
    if (typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return 'Error al actualizar el estado';
};

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
   * Mapea el estado del Kanban a estadoPicking del backend
   * @param status - Estado del Kanban
   * @returns Estado de picking del backend (o null si no aplica)
   */
  const mapKanbanStatusToPickingStatus = (status: PickingOrderStatus): PickingStatus | null => {
    switch (status) {
      case 'Picking':
        return 'iniciado';
      case 'Confirmación':
        return 'confirmado';
      case 'Despachado':
        // en el backend, "en_ruta" queda tras confirmPicking
        return 'en_ruta';
      case 'Nota de venta emitida':
      default:
        return null;
    }
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

      // Si el usuario mueve a "Despachado", el flujo correcto es confirmar picking:
      // requiere que la nota esté aprobada y estadoPicking="confirmado".
      if (newStatus === 'Despachado') {
        await quotesService.confirmPicking(quoteId);
        toast.success('Picking confirmado: despacho registrado y factura emitida');
        refetch();
        return;
      }

      const pickingStatus = mapKanbanStatusToPickingStatus(newStatus);
      if (!pickingStatus) {
        // "Devolver a Nota de venta emitida": limpiamos estadoPicking (nullable) vía updateQuote.
        await quotesService.updateQuote(quoteId, { estadoPicking: null });
        toast.success('Estado de picking reiniciado');
        refetch();
        return;
      }

      await quotesService.updatePickingStatus(quoteId, pickingStatus);
      toast.success(`Estado actualizado a: ${newStatus}`);
    } catch (error) {
      logger.error('[PICKING] Error actualizando estado', error);
      toast.error(getReadableErrorMessage(error));
      // Revertir cambio optimista
      refetch();
    }
  }, [refetch]);

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
