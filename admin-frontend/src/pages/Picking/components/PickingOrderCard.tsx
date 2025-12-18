import { useState } from 'react';
import { Button } from '../../../components/commons';
import { EyeIcon } from '../../../components/commons/icons';
import { Select } from '../../../components/commons';
import type { PickingOrder, PickingOrderStatus } from '../types';
import { OrderDetailModal } from './OrderDetailModal';

interface PickingOrderCardProps {
  order: PickingOrder;
  onStatusChange: (orderId: string, newStatus: PickingOrderStatus) => void;
}

/**
 * Componente de tarjeta para una orden de bodega
 * @param props - Props del componente PickingOrderCard
 * @returns Componente PickingOrderCard
 */
export const PickingOrderCard = ({ order, onStatusChange }: PickingOrderCardProps): React.ReactElement => {
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
   * Obtiene las opciones de estado según el estado actual
   */
  const getStatusOptions = (): Array<{ value: PickingOrderStatus; label: string }> => {
    // En Picking permite devolver a Nota de venta emitida o pasar a Confirmación
    if (order.estado === 'Picking') {
      return [
        { value: 'Nota de venta emitida', label: 'Devolver a Nota de venta emitida' },
        { value: 'Confirmación', label: 'Pasar a Confirmación' }
      ];
    }
    
    // En Confirmación permite devolver a Picking o pasar a Despachado
    if (order.estado === 'Confirmación') {
      return [
        { value: 'Picking', label: 'Devolver a Picking' },
        { value: 'Despachado', label: 'Pasar a Despachado' }
      ];
    }
    
    // En Despachado permite devolver a Confirmación o confirmar despacho a ruta
    if (order.estado === 'Despachado') {
      return [
        { value: 'Confirmación', label: 'Devolver a Confirmación' },
        { value: 'Despachado', label: 'Confirmar despacho a ruta' }
      ];
    }
    
    // Para otros estados, solo muestra el estado actual
    return [
      { value: order.estado, label: order.estado }
    ];
  };

  /**
   * Maneja el cambio de estado
   */
  const handleStatusChange = (value: string): void => {
    const newStatus = value as PickingOrderStatus;
    // Si está en Despachado y selecciona "Confirmar despacho a ruta", mantiene el estado pero podría ejecutar lógica adicional
    if (order.estado === 'Despachado' && newStatus === 'Despachado') {
      // Aquí se podría agregar lógica adicional para confirmar el despacho a ruta
      // Por ahora, no hace nada ya que el estado no cambia
      return;
    }
    if (newStatus !== order.estado) {
      onStatusChange(order.id, newStatus);
    }
  };

  /**
   * Maneja el click del botón para pasar a picking
   */
  const handleMoveToPicking = (): void => {
    onStatusChange(order.id, 'Picking');
  };

  /**
   * Obtiene el color del badge según el estado
   */
  const getStatusColor = (status: PickingOrderStatus): string => {
    switch (status) {
      case 'Nota de venta emitida':
        return 'bg-yellow-100 text-yellow-800';
      case 'Picking':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmación':
        return 'bg-purple-100 text-purple-800';
      case 'Despachado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 w-full h-[220px] flex flex-col overflow-hidden">
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
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div>
              <label className="text-[10px] text-gray-500">Vendedor</label>
              <p className="text-xs font-medium text-gray-900 mt-0.5 break-words">{order.vendedor}</p>
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Cantidad de productos</label>
              <p className="text-xs font-medium text-gray-900 mt-0.5">{order.cantidadProductos}</p>
            </div>
          </div>

          {/* Selector de estado y botón detalle */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 mt-auto flex-shrink-0 relative">
            {order.estado === 'Nota de venta emitida' ? (
              <Button
                onClick={handleMoveToPicking}
                className="bg-[#0052C9] text-white hover:bg-[#004BB7] flex items-center gap-1.5 text-xs px-3 py-1.5 flex-1"
              >
                Pasar a picking
              </Button>
            ) : (
              <div className="flex-1 min-w-0 relative z-10">
                <Select
                  value={order.estado === 'Picking' || order.estado === 'Confirmación' || order.estado === 'Despachado' ? '' : order.estado}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  options={getStatusOptions()}
                  selectClassName="w-full text-xs py-1 min-w-0"
                  disabled={order.estado !== 'Picking' && order.estado !== 'Confirmación' && order.estado !== 'Despachado'}
                  placeholder={order.estado === 'Picking' || order.estado === 'Confirmación' || order.estado === 'Despachado' ? 'Seleccionar acción' : undefined}
                />
              </div>
            )}
            <Button
              onClick={() => setIsDetailModalOpen(true)}
              className="bg-[#0052C9] text-white hover:bg-[#004BB7] flex items-center gap-1.5 text-xs px-2 py-1 flex-shrink-0"
              leftIcon={<EyeIcon color="white" />}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={order}
      />
    </>
  );
};

