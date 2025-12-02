import { useState, useMemo } from 'react';
import { PickingOrderCard } from '../components/PickingOrderCard';
import { SearchBar } from '../../../components/commons';
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
  const [searchValue, setSearchValue] = useState('');

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

  /**
   * Filtra las órdenes según los filtros aplicados y búsqueda
   */
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filtro por búsqueda
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(order =>
        order.codigoOrden.toLowerCase().includes(searchLower) ||
        order.vendedor.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado) {
      result = result.filter(order => order.estado === filters.estado);
    }

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
  }, [orders, filters, searchValue]);

  /**
   * Maneja el cambio en el input de búsqueda
   */
  const handleSearchChange = (value: string): void => {
    setSearchValue(value);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <SearchBar 
        searchValue={searchValue} 
        onSearchChange={handleSearchChange}
        placeholder="Buscar por código de orden o vendedor..."
      />

      <div className="flex-1 overflow-auto rounded-lg shadow-sm bg-white border border-gray-200 p-4">
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <PickingOrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
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

