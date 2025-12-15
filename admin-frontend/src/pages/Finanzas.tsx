import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader, DataTablePage } from '../components/commons';
import { columns } from './Finanzas/columns';
import { getCookie } from '../utils/cookies';

const API_URL = import.meta.env.VITE_API_URL || 'https://zzv7qnwgz1.execute-api.us-east-1.amazonaws.com/dev/dev';
const WSS_ENDPOINT = import.meta.env.VITE_WS_URL || 'wss://4hple5xva0.execute-api.us-east-1.amazonaws.com/dev';

interface PickingOrder {
  id: string;
  numeroCotizacion: string;
  clienteNombre: string;
  estado: string;
  estadoPicking: string | null;
  cantidadProductos: number;
  monto: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalReservas: number;
  valorTotalReservado: number;
  ordenesIniciadas: number;
  ordenesRecolectadas: number;
  ordenesConfirmadas: number;
  ordenesEnRuta: number;
}

export const Finanzas = () => {
  const [orders, setOrders] = useState<PickingOrder[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReservas: 0,
    valorTotalReservado: 0,
    ordenesIniciadas: 0,
    ordenesRecolectadas: 0,
    ordenesConfirmadas: 0,
    ordenesEnRuta: 0
  });
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket para actualizaciones en tiempo real
  const connectWebSocket = useCallback(() => {
    const token = getCookie('authToken');
    const wsUrl = token 
      ? `${WSS_ENDPOINT}?token=${encodeURIComponent(token)}`
      : WSS_ENDPOINT;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket Finanzas conectado');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Actualización de estado de picking
        if (data.action === 'picking_status_updated') {
          setOrders(prev => {
            const updated = prev.map(order => {
              if (order.id === data.quoteId.toString()) {
                return { ...order, estadoPicking: data.estadoPicking };
              }
              return order;
            });
            calculateStats(updated);
            return updated;
          });
        }

        // Nueva reserva creada
        if (data.action === 'quote_stock_reserved') {
          console.log('📦 Nueva reserva de stock:', data);
          fetchOrders();
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket desconectado');
    };

    return ws;
  }, []);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/quotes?estado=aprobada`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching orders');

      const data = await response.json();
      
      // Filtrar solo quotes aprobadas y mapear
      const approvedOrders = data.data
        .filter((q: any) => q.estado === 'aprobada')
        .map((q: any) => ({
          id: q.id.toString(),
          numeroCotizacion: q.numeroCotizacion || `Q-${q.id}`,
          clienteNombre: q.clienteNombre,
          estado: q.estado,
          estadoPicking: q.estadoPicking || null,
          cantidadProductos: q.productos ? JSON.parse(q.productos).length : 0,
          monto: calculateMonto(q.productos),
          createdAt: q.createdAt,
          updatedAt: q.updatedAt
        }));

      setOrders(approvedOrders);
      calculateStats(approvedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular monto total
  const calculateMonto = (productosJson: string | null): number => {
    if (!productosJson) return 0;
    try {
      const productos = JSON.parse(productosJson);
      return productos.reduce((acc: number, p: any) => {
        const precio = p.precio || 0;
        const cantidad = p.cantidad || p.cantidadSolicitada || 0;
        return acc + (precio * cantidad);
      }, 0);
    } catch {
      return 0;
    }
  };

  // Calcular estadísticas
  const calculateStats = (ordersData: PickingOrder[]) => {
    const newStats: Stats = {
      totalReservas: ordersData.length,
      valorTotalReservado: ordersData.reduce((acc, o) => acc + o.monto, 0),
      ordenesIniciadas: ordersData.filter(o => o.estadoPicking === 'iniciado').length,
      ordenesRecolectadas: ordersData.filter(o => o.estadoPicking === 'recolectado').length,
      ordenesConfirmadas: ordersData.filter(o => o.estadoPicking === 'confirmado').length,
      ordenesEnRuta: ordersData.filter(o => o.estadoPicking === 'en_ruta').length
    };
    setStats(newStats);
  };

  // Actualizar orden cuando llega mensaje WebSocket
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtrar órdenes
  const filteredOrders = estadoFilter
    ? orders.filter(o => o.estadoPicking === estadoFilter)
    : orders;

  return (
    <div className="w-full h-full flex flex-col p-4">
      <PageHeader title="Módulo de Finanzas" />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Reservas</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.totalReservas}</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Valor Reservado</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            ${stats.valorTotalReservado.toLocaleString('es-CL')}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Iniciado</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.ordenesIniciadas}</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium">Recolectado</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{stats.ordenesRecolectadas}</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Confirmado</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{stats.ordenesConfirmadas}</div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-sm text-indigo-600 font-medium">En Ruta</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{stats.ordenesEnRuta}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Estado Picking:</label>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="iniciado">Iniciado</option>
            <option value="recolectado">Recolectado</option>
            <option value="confirmado">Confirmado</option>
            <option value="en_ruta">En Ruta</option>
          </select>
          <button
            onClick={fetchOrders}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Cargando órdenes...</div>
          </div>
        ) : (
          <DataTablePage
            columns={columns}
            data={filteredOrders}
          />
        )}
      </div>
    </div>
  );
};
