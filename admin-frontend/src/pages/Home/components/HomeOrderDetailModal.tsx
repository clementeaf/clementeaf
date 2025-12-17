import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderDetailModal } from '../../Picking/components/OrderDetailModal';
import type { PickingOrder, PickingOrderStatus } from '../../Picking/types';
import type { HomeOrder, HomeOrderStatus } from '../types';
import { quotesService } from '../../../services/quotesService';
import type { Quote } from '../../../services/quotesService';

interface HomeOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: HomeOrder;
}

type QuoteProductRaw = {
  id?: unknown;
  codigo?: unknown;
  nombre?: unknown;
  ubicacion?: unknown;
  stock?: unknown;
  cantidad?: unknown;
  cantidadSolicitada?: unknown;
  warehouseId?: unknown;
  bodegaId?: unknown;
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

/**
 * Modal de detalle reutilizando `OrderDetailModal` para una orden de Home.
 * @param props - Props del componente
 * @returns Modal de detalle
 */
export const HomeOrderDetailModal = ({ isOpen, onClose, order }: HomeOrderDetailModalProps): React.ReactElement => {
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
    enabled: isOpen && quoteId !== null,
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
    <OrderDetailModal
      isOpen={isOpen}
      onClose={onClose}
      order={pickingOrderForModal}
    />
  );
};


