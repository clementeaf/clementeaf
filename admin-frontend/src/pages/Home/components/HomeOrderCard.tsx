import type { HomeOrder, HomeOrderStatus } from '../types';

interface HomeOrderCardProps {
  order: HomeOrder;
  onStatusChange: (orderId: string, newStatus: HomeOrderStatus) => void;
}

/**
 * Componente de tarjeta para una orden en el dashboard de inicio
 * @param props - Props del componente HomeOrderCard
 * @returns Componente HomeOrderCard
 */
export const HomeOrderCard = ({ order }: HomeOrderCardProps): React.ReactElement => {
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

  return (
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
      </div>
    </div>
  );
};

