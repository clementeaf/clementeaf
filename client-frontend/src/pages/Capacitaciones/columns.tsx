import { type ColumnDef } from '@tanstack/react-table';
import type { TrainingRow } from './types';

/**
 * Definición de columnas para la tabla de capacitaciones
 */
export const trainingColumns: ColumnDef<TrainingRow>[] = [
  {
    accessorKey: 'productName',
    header: 'Producto',
    enableSorting: true
  },
  {
    accessorKey: 'billNumber',
    header: 'Factura',
    enableSorting: true
  },
  {
    accessorKey: 'title',
    header: 'Título',
    enableSorting: true
  },
  {
    accessorKey: 'duration',
    header: 'Duración',
    enableSorting: false,
    cell: ({ getValue }) => {
      const duration = getValue() as string | undefined;
      return duration ? <span className="text-sm">{duration}</span> : <span className="text-sm text-gray-400">-</span>;
    }
  },
  {
    accessorKey: 'availableDate',
    header: 'Fecha Disponible',
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    enableSorting: true,
    cell: ({ getValue }) => {
      const status = getValue() as TrainingRow['status'];
      const statusColors: Record<string, string> = {
        'Disponible': 'bg-blue-100 text-blue-800',
        'En progreso': 'bg-yellow-100 text-yellow-800',
        'Completado': 'bg-green-100 text-green-800'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    enableSorting: false,
    cell: ({ row }) => {
      const handleView = (): void => {
        console.log('Ver capacitación:', row.original.id);
      };

      return (
        <button
          onClick={handleView}
          className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          Ver Video
        </button>
      );
    }
  }
];

