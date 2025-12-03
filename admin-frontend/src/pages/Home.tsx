import { useState } from 'react';
import { HomeKanbanBoard } from './Home/components';
import type { HomeOrder, HomeOrderStatus } from './Home/types';

/**
 * Página de inicio
 * @returns Componente Home
 */
export const Home = (): React.ReactElement => {
  // Datos de ejemplo - En producción esto vendría de un hook/API
  const [orders, setOrders] = useState<HomeOrder[]>([
    // Nota de Venta
    {
      id: '1',
      codigoOrden: 'NV-001',
      fechaHoraOrden: new Date().toISOString(),
      cliente: 'Cliente A',
      vendedor: 'Juan Pérez',
      monto: 150000,
      estado: 'Nota de Venta'
    },
    {
      id: '2',
      codigoOrden: 'NV-002',
      fechaHoraOrden: new Date(Date.now() - 86400000).toISOString(),
      cliente: 'Cliente B',
      vendedor: 'María González',
      monto: 250000,
      estado: 'Nota de Venta'
    },
    // Picking
    {
      id: '3',
      codigoOrden: 'NV-003',
      fechaHoraOrden: new Date(Date.now() - 172800000).toISOString(),
      cliente: 'Cliente C',
      vendedor: 'Carlos Rodríguez',
      monto: 180000,
      estado: 'Picking'
    },
    {
      id: '4',
      codigoOrden: 'NV-004',
      fechaHoraOrden: new Date(Date.now() - 259200000).toISOString(),
      cliente: 'Cliente D',
      vendedor: 'Ana Martínez',
      monto: 320000,
      estado: 'Picking'
    },
    // Factura
    {
      id: '5',
      codigoOrden: 'NV-005',
      fechaHoraOrden: new Date(Date.now() - 345600000).toISOString(),
      cliente: 'Cliente E',
      vendedor: 'Pedro Sánchez',
      monto: 450000,
      estado: 'Factura'
    },
    // Ruta
    {
      id: '6',
      codigoOrden: 'NV-006',
      fechaHoraOrden: new Date(Date.now() - 432000000).toISOString(),
      cliente: 'Cliente F',
      vendedor: 'Laura Fernández',
      monto: 280000,
      estado: 'Ruta'
    },
    {
      id: '7',
      codigoOrden: 'NV-007',
      fechaHoraOrden: new Date(Date.now() - 518400000).toISOString(),
      cliente: 'Cliente G',
      vendedor: 'Roberto López',
      monto: 195000,
      estado: 'Ruta'
    }
  ]);

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
          {orders.length > 0 ? (
            <HomeKanbanBoard
              orders={orders}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">No hay órdenes disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

