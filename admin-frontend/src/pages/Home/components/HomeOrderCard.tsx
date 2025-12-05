import type { HomeOrder, HomeOrderStatus } from '../types';

interface HomeOrderCardProps {
  order: HomeOrder;
  onStatusChange: (orderId: string, newStatus: HomeOrderStatus) => void;
  onDelete?: (orderId: string) => void;
}

/**
 * Componente de tarjeta para una orden en el dashboard de inicio
 * @param props - Props del componente HomeOrderCard
 * @returns Componente HomeOrderCard
 */
export const HomeOrderCard = ({ order, onDelete }: HomeOrderCardProps): React.ReactElement => {
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
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 w-full flex flex-col overflow-hidden" style={{ minHeight: order.estado === 'Nota de Venta' && onDelete ? '260px' : '220px' }}>
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

        {/* Botón de eliminar solo para Nota de Venta */}
        {order.estado === 'Nota de Venta' && onDelete && (
          <div className="mt-auto pt-3 flex-shrink-0">
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
          </div>
        )}
      </div>
    </div>
  );
};

