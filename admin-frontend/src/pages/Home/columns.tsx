import { type ColumnDef } from '@tanstack/react-table';
import { Button, Tag } from '../../components/commons';
import { EyeIcon } from '../../components/commons/icons';
import type { HomeOrder, HomeOrderStatus } from './Home/types';

/**
 * Acciones disponibles en la tabla de Inicio.
 */
export interface HomeOrdersTableActions {
  onViewDetails: (order: HomeOrder) => void;
  onDelete?: (orderId: string) => void;
}

/**
 * Formatea una fecha ISO a formato DD/MM/YYYY HH:mm.
 * @param dateString - Fecha ISO
 * @returns Fecha formateada
 */
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

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
 * Obtiene clases para el badge según estado.
 * @param status - Estado
 * @returns Clases Tailwind
 */
const getStatusTagClassName = (status: HomeOrderStatus): string => {
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
 * Definición de columnas para la vista tabla de Inicio.
 * @param actions - Acciones de la tabla
 * @returns Columnas
 */
export const getHomeOrdersColumns = (actions: HomeOrdersTableActions): ColumnDef<HomeOrder>[] => [
  {
    accessorKey: 'codigoOrden',
    header: 'Código',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 break-words">
        {row.original.codigoOrden}
      </div>
    )
  },
  {
    accessorKey: 'fechaHoraOrden',
    header: 'Fecha',
    cell: ({ row }) => (
      <div className="text-gray-700">
        {formatDateTime(row.original.fechaHoraOrden)}
      </div>
    )
  },
  {
    accessorKey: 'cliente',
    header: 'Cliente',
    cell: ({ row }) => (
      <div className="text-gray-900 break-words">
        {row.original.cliente}
      </div>
    )
  },
  {
    accessorKey: 'vendedor',
    header: 'Vendedor',
    cell: ({ row }) => (
      <div className="text-gray-900 break-words">
        {row.original.vendedor}
      </div>
    )
  },
  {
    accessorKey: 'monto',
    header: 'Monto',
    cell: ({ row }) => (
      <div className="text-right font-medium text-gray-900">
        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(row.original.monto)}
      </div>
    )
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => (
      <Tag className={getStatusTagClassName(row.original.estado)}>
        {row.original.estado}
      </Tag>
    )
  },
  {
    id: 'actions',
    header: 'Acciones',
    enableSorting: false,
    cell: ({ row }) => {
      const canDelete = row.original.estado === 'Nota de Venta' && typeof actions.onDelete === 'function';
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              actions.onViewDetails(row.original);
            }}
            className="bg-white text-[#0052C9] border border-[#0052C9] hover:bg-[#EAF2FF] text-xs px-3 py-2"
            leftIcon={<EyeIcon color="#0052C9" />}
          >
            Ver detalles
          </Button>
          {canDelete && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                actions.onDelete?.(row.original.id);
              }}
              className="bg-white text-red-600 border border-red-200 hover:bg-red-50 text-xs px-3 py-2"
            >
              Eliminar
            </Button>
          )}
        </div>
      );
    }
  }
];


