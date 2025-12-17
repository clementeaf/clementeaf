import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { HomeOrder, HomeOrderStatus } from '../types';
import { Button } from '../../../components/commons';
import { EyeIcon } from '../../../components/commons/icons';
import { OrderDetailModal } from '../../Picking/components/OrderDetailModal';
import type { PickingOrder, PickingOrderStatus } from '../../Picking/types';
import { quotesService } from '../../../services/quotesService';
import type { Quote } from '../../../services/quotesService';

interface HomeOrderCardProps {
  order: HomeOrder;
  onStatusChange: (orderId: string, newStatus: HomeOrderStatus) => void;
  onDelete?: (orderId: string) => void;
}

type QuoteProductRaw = {
  id?: unknown;
  codigo?: unknown;
  nombre?: unknown;
  ubicacion?: unknown;
  stock?: unknown;
  cantidad?: unknown;
  cantidadSolicitada?: unknown;
};

/**
 * Componente de tarjeta para una orden en el dashboard de inicio
 * @param props - Props del componente HomeOrderCard
 * @returns Componente HomeOrderCard
 */
export const HomeOrderCard = ({ order, onDelete }: HomeOrderCardProps): React.ReactElement => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  /**
   * Formatea una fecha ISO a formato DD/MM/YYYY HH:mm
   */
  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  /**
   * Formatea un monto a formato de moneda
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  /**
   * Obtiene el color del badge según el estado
   */
  const getStatusColor = (status: HomeOrderStatus): string => {
    switch (status) {
      case 'Nota de Venta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Picking':
        return 'bg-blue-100 text-blue-800';
      case 'Factura':
        return 'bg-purple-100 text-purple-800';
      case 'Ruta':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Convierte el estado de Home al estado esperado por Picking (para el modal de detalle).
   * @param status - Estado del tablero Home
   * @returns Estado equivalente en Picking
   */
  const mapHomeStatusToPickingStatus = (status: HomeOrderStatus): PickingOrderStatus => {
    switch (status) {
      case 'Nota de Venta':
        return 'Nota de venta emitida';
      case 'Picking':
        return 'Picking';
      case 'Factura':
        return 'Confirmación';
      case 'Ruta':
        return 'Despachado';
      default:
        return 'Nota de venta emitida';
    }
  };

  /**
   * Parsea el JSON de productos de una quote a la estructura de productos de picking.
   * @param productosJson - JSON serializado con productos
   * @returns Lista normalizada de productos para el modal de detalle
   */
  const parseQuoteProductsToPicking = (productosJson: string | null | undefined): PickingOrder['productos'] => {
    if (!productosJson) return [];
    try {
      const parsed: unknown = JSON.parse(productosJson);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((p: unknown): PickingOrder['productos'][number] | null => {
          if (!p || typeof p !== 'object') return null;
          const raw = p as QuoteProductRaw;

          const codigo = typeof raw.codigo === 'string' && raw.codigo.trim().length > 0 ? raw.codigo.trim() : 'SIN-CODIGO';
          const nombre = typeof raw.nombre === 'string' && raw.nombre.trim().length > 0 ? raw.nombre.trim() : 'Producto sin nombre';
          const ubicacion = typeof raw.ubicacion === 'string' ? raw.ubicacion : '-';

          const stock = typeof raw.stock === 'number'
            ? raw.stock
            : (typeof raw.stock === 'string' ? Number(raw.stock) : 0);

          const cantidadSolicitadaCandidate = typeof raw.cantidadSolicitada === 'number'
            ? raw.cantidadSolicitada
            : (typeof raw.cantidadSolicitada === 'string' ? Number(raw.cantidadSolicitada) : undefined);

          const cantidadCandidate = typeof raw.cantidad === 'number'
            ? raw.cantidad
            : (typeof raw.cantidad === 'string' ? Number(raw.cantidad) : undefined);

          const cantidadSolicitada = Number.isFinite(cantidadSolicitadaCandidate)
            ? (cantidadSolicitadaCandidate as number)
            : (Number.isFinite(cantidadCandidate) ? (cantidadCandidate as number) : 0);

          const idValue = typeof raw.id === 'string'
            ? raw.id
            : (typeof raw.id === 'number' ? String(raw.id) : codigo);

          return {
            id: idValue,
            codigo,
            nombre,
            ubicacion,
            stock: Number.isFinite(stock) ? stock : 0,
            cantidadSolicitada: Number.isFinite(cantidadSolicitada) ? cantidadSolicitada : 0
          };
        })
        .filter((p): p is PickingOrder['productos'][number] => p !== null);
    } catch {
      return [];
    }
  };

  const quoteId = useMemo((): number | null => {
    const parsed = Number.parseInt(order.id, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [order.id]);

  const { data: quoteData } = useQuery<Quote | null>({
    queryKey: ['homeOrderQuoteDetail', quoteId],
    queryFn: async () => {
      if (quoteId === null) return null;
      return await quotesService.getQuoteById(quoteId, { includeInvoice: true, includeInvoiceXml: true });
    },
    enabled: isDetailModalOpen && quoteId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false
  });

  const pickingOrderForModal = useMemo<PickingOrder>(() => {
    const productos = parseQuoteProductsToPicking(quoteData?.productos ?? null);

    return {
      id: order.id,
      codigoOrden: order.codigoOrden,
      fechaHoraOrden: order.fechaHoraOrden,
      vendedor: quoteData?.asesorAsignado ?? order.vendedor,
      cantidadProductos: productos.length,
      estado: mapHomeStatusToPickingStatus(order.estado),
      productos
    };
  }, [order, quoteData]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 w-full flex flex-col overflow-hidden" style={{ minHeight: order.estado === 'Nota de Venta' && onDelete ? '300px' : '250px' }}>
        <div className="flex flex-col gap-3 min-w-0 flex-1 overflow-hidden">
        {/* Header con código de orden y estado */}
        <div className="flex items-start justify-between gap-2 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">Código: {order.codigoOrden}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(order.fechaHoraOrden)}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(order.estado)}`}>
            {order.estado}
          </span>
        </div>

        {/* Información de la orden */}
        <div className="grid grid-cols-1 gap-3 flex-shrink-0">
          <div>
            <label className="text-[10px] text-gray-500">Cliente</label>
            <p className="text-xs font-medium text-gray-900 mt-0.5 break-words">{order.cliente}</p>
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Vendedor</label>
            <p className="text-xs font-medium text-gray-900 mt-0.5 break-words">{order.vendedor}</p>
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Monto</label>
            <p className="text-xs font-medium text-gray-900 mt-0.5">{formatCurrency(order.monto)}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-auto pt-3 flex-shrink-0 space-y-2">
          <Button
            onClick={() => setIsDetailModalOpen(true)}
            className="w-full bg-[#0052C9] text-white hover:bg-[#004BB7] flex items-center justify-center gap-1.5 text-xs px-3 py-2"
            leftIcon={<EyeIcon color="white" />}
          >
            Ver detalles
          </Button>

          {/* Botón de eliminar solo para Nota de Venta */}
          {order.estado === 'Nota de Venta' && onDelete && (
            <button
              onClick={() => onDelete(order.id)}
              className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 5H5H17M8 5V3C8 2.46957 8.21071 1.96086 8.58579 1.58579C8.96086 1.21071 9.46957 1 10 1C10.5304 1 11.0391 1.21071 11.4142 1.58579C11.7893 1.96086 12 2.46957 12 3V5M15 5V17C15 17.5304 14.7893 18.0391 14.4142 18.4142C14.0391 18.7893 13.5304 19 13 19H7C6.46957 19 5.96086 18.7893 5.58579 18.4142C5.21071 18.0391 5 17.5304 5 17V5H15Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={pickingOrderForModal}
      />
    </>
  );
};

