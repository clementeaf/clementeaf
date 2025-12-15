import type { ColumnDef } from '@tanstack/react-table';

export interface FinanzasRow {
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

const estadoPickingColors: Record<string, string> = {
  iniciado: 'bg-yellow-100 text-yellow-800',
  recolectado: 'bg-orange-100 text-orange-800',
  confirmado: 'bg-purple-100 text-purple-800',
  en_ruta: 'bg-indigo-100 text-indigo-800',
};

const estadoPickingLabels: Record<string, string> = {
  iniciado: 'Iniciado',
  recolectado: 'Recolectado',
  confirmado: 'Confirmado',
  en_ruta: 'En Ruta',
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const columns: ColumnDef<FinanzasRow>[] = [
  {
    accessorKey: 'numeroCotizacion',
    header: 'N° Cotización',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.original.numeroCotizacion}
      </div>
    ),
  },
  {
    accessorKey: 'clienteNombre',
    header: 'Cliente',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900">
        {row.original.clienteNombre}
      </div>
    ),
  },
  {
    accessorKey: 'estadoPicking',
    header: 'Estado Picking',
    cell: ({ row }) => {
      const estado = row.original.estadoPicking;
      if (!estado) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pendiente
          </span>
        );
      }
      const colorClass = estadoPickingColors[estado] || 'bg-gray-100 text-gray-800';
      const label = estadoPickingLabels[estado] || estado;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: 'cantidadProductos',
    header: 'Productos',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900 text-center">
        {row.original.cantidadProductos}
      </div>
    ),
  },
  {
    accessorKey: 'monto',
    header: 'Monto',
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-900">
        ${row.original.monto.toLocaleString('es-CL')}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha Creación',
    cell: ({ row }) => (
      <div className="text-sm text-gray-500">
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Última Actualización',
    cell: ({ row }) => (
      <div className="text-sm text-gray-500">
        {formatDate(row.original.updatedAt)}
      </div>
    ),
  },
];
