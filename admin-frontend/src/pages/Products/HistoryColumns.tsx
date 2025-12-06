import { type ColumnDef } from '@tanstack/react-table';
import type { StockMovement } from '../../services/stockMovementsService';
import { MovementType } from '../../services/stockMovementsService';
import { cn } from '../../utils/cn';

/**
 * Obtiene el color y label para el tipo de movimiento
 */
const getMovementTypeStyle = (type: MovementType): { label: string; className: string } => {
  switch (type) {
    case MovementType.ENTRADA:
      return { label: 'Entrada', className: 'bg-green-100 text-green-800' };
    case MovementType.SALIDA:
      return { label: 'Salida', className: 'bg-red-100 text-red-800' };
    case MovementType.AJUSTE:
      return { label: 'Ajuste', className: 'bg-yellow-100 text-yellow-800' };
    case MovementType.TRANSFERENCIA:
      return { label: 'Transferencia', className: 'bg-blue-100 text-blue-800' };
    default:
      return { label: type, className: 'bg-gray-100 text-gray-800' };
  }
};

/**
 * Formatea una fecha para mostrar
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Columnas para la tabla de historial de movimientos
 */
export const historyColumns: ColumnDef<StockMovement>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Fecha',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900">
        {formatDate(row.original.createdAt)}
      </div>
    )
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const { label, className } = getMovementTypeStyle(row.original.type);
      return (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', className)}>
          {label}
        </span>
      );
    }
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) => {
      const cantidad = row.original.cantidad;
      const isEntrada = row.original.type === MovementType.ENTRADA || row.original.type === MovementType.AJUSTE;
      return (
        <div className={cn('text-sm font-medium', isEntrada ? 'text-green-600' : 'text-red-600')}>
          {isEntrada ? '+' : '-'}{cantidad.toLocaleString('es-CL')}
        </div>
      );
    }
  },
  {
    accessorKey: 'stockAnterior',
    header: 'Stock Anterior',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.stockAnterior.toLocaleString('es-CL')}
      </div>
    )
  },
  {
    accessorKey: 'stockNuevo',
    header: 'Stock Nuevo',
    cell: ({ row }) => (
      <div className="text-sm font-semibold text-gray-900">
        {row.original.stockNuevo.toLocaleString('es-CL')}
      </div>
    )
  },
  {
    accessorKey: 'stockAcumulativo',
    header: 'Stock Acum.',
    cell: ({ row }) => (
      <div className="text-sm font-bold text-blue-600">
        {row.original.stockAcumulativo.toLocaleString('es-CL')}
      </div>
    )
  },
  {
    accessorKey: 'documento',
    header: 'Documento',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.documento || '-'}
      </div>
    )
  },
  {
    accessorKey: 'numeroDocumento',
    header: 'N° Documento',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.numeroDocumento || '-'}
      </div>
    )
  },
  {
    accessorKey: 'lote',
    header: 'Lote',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.lote || '-'}
      </div>
    )
  },
  {
    accessorKey: 'observaciones',
    header: 'Observaciones',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 max-w-xs truncate" title={row.original.observaciones || undefined}>
        {row.original.observaciones || '-'}
      </div>
    )
  }
];

