import { useState } from 'react';
import { PickingOrderCard } from '../components/PickingOrderCard';
import type { PickingOrder, PickingOrderStatus } from '../types';

/**
 * Componente de sección de Orden de picking
 * @returns Componente OrderSection
 */
export const OrderSection = (): React.ReactElement => {
  // Datos de ejemplo - En producción esto vendría de un hook/API
  const [orders, setOrders] = useState<PickingOrder[]>([
    {
      id: '1',
      codigoOrden: 'ORD-001',
      fechaHoraOrden: new Date().toISOString(),
      vendedor: 'Juan Pérez',
      cantidadProductos: 5,
      estado: 'Picking',
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
      estado: 'Solicitud venta',
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
    {
      id: '3',
      codigoOrden: 'ORD-003',
      fechaHoraOrden: new Date(Date.now() - 172800000).toISOString(),
      vendedor: 'Carlos Rodríguez',
      cantidadProductos: 8,
      estado: 'Confirmación',
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

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Órdenes de Picking</h3>
        <p className="text-sm text-gray-500">Gestiona las órdenes de picking y su estado</p>
      </div>

      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <PickingOrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay órdenes de picking disponibles</p>
        </div>
      )}
    </div>
  );
};

