import { useState, useMemo } from 'react';
import { PickingKanbanBoard } from '../components/PickingKanbanBoard';
import type { PickingOrder, PickingOrderStatus } from '../types';
import type { PickingFilters } from '../PickingSidebar';

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
  const [orders, setOrders] = useState<PickingOrder[]>([
    // Nota de venta emitida
    {
      id: '1',
      codigoOrden: 'ORD-001',
      fechaHoraOrden: new Date().toISOString(),
      vendedor: 'Juan Pérez',
      cantidadProductos: 5,
      estado: 'Nota de venta emitida',
      productos: [
        {
          id: '1',
          nombre: 'Producto A',
          codigo: 'PROD-001',
          ubicacion: 'A-1-2',
          stock: 100,
          cantidadSolicitada: 10
        },
        {
          id: '2',
          nombre: 'Producto B',
          codigo: 'PROD-002',
          ubicacion: 'B-3-4',
          stock: 50,
          cantidadSolicitada: 5
        }
      ]
    },
    {
      id: '2',
      codigoOrden: 'ORD-002',
      fechaHoraOrden: new Date(Date.now() - 86400000).toISOString(),
      vendedor: 'María González',
      cantidadProductos: 3,
      estado: 'Nota de venta emitida',
      productos: [
        {
          id: '3',
          nombre: 'Producto C',
          codigo: 'PROD-003',
          ubicacion: 'C-5-6',
          stock: 75,
          cantidadSolicitada: 15
        }
      ]
    },
    // Picking
    {
      id: '3',
      codigoOrden: 'ORD-003',
      fechaHoraOrden: new Date(Date.now() - 172800000).toISOString(),
      vendedor: 'Carlos Rodríguez',
      cantidadProductos: 8,
      estado: 'Picking',
      productos: [
        {
          id: '4',
          nombre: 'Producto D',
          codigo: 'PROD-004',
          ubicacion: 'D-7-8',
          stock: 200,
          cantidadSolicitada: 20
        },
        {
          id: '5',
          nombre: 'Producto E',
          codigo: 'PROD-005',
          ubicacion: 'E-9-10',
          stock: 150,
          cantidadSolicitada: 12
        }
      ]
    },
    {
      id: '4',
      codigoOrden: 'ORD-004',
      fechaHoraOrden: new Date(Date.now() - 259200000).toISOString(),
      vendedor: 'Ana Martínez',
      cantidadProductos: 4,
      estado: 'Picking',
      productos: [
        {
          id: '6',
          nombre: 'Producto F',
          codigo: 'PROD-006',
          ubicacion: 'F-11-12',
          stock: 80,
          cantidadSolicitada: 8
        }
      ]
    },
    // Confirmación
    {
      id: '5',
      codigoOrden: 'ORD-005',
      fechaHoraOrden: new Date(Date.now() - 345600000).toISOString(),
      vendedor: 'Pedro Sánchez',
      cantidadProductos: 6,
      estado: 'Confirmación',
      productos: [
        {
          id: '7',
          nombre: 'Producto G',
          codigo: 'PROD-007',
          ubicacion: 'G-13-14',
          stock: 120,
          cantidadSolicitada: 15
        }
      ]
    },
    // Despachado
    {
      id: '6',
      codigoOrden: 'ORD-006',
      fechaHoraOrden: new Date(Date.now() - 432000000).toISOString(),
      vendedor: 'Laura Fernández',
      cantidadProductos: 2,
      estado: 'Despachado',
      productos: [
        {
          id: '8',
          nombre: 'Producto H',
          codigo: 'PROD-008',
          ubicacion: 'H-15-16',
          stock: 90,
          cantidadSolicitada: 5
        }
      ]
    },
    {
      id: '7',
      codigoOrden: 'ORD-007',
      fechaHoraOrden: new Date(Date.now() - 518400000).toISOString(),
      vendedor: 'Roberto López',
      cantidadProductos: 7,
      estado: 'Despachado',
      productos: [
        {
          id: '9',
          nombre: 'Producto I',
          codigo: 'PROD-009',
          ubicacion: 'I-17-18',
          stock: 110,
          cantidadSolicitada: 12
        }
      ]
    }
  ]);

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

