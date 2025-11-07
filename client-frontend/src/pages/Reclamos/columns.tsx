import { type ColumnDef } from '@tanstack/react-table';
import type { ClaimRow } from './types';

/**
 * Definición de columnas para la tabla de reclamos
 */
export const claimColumns: ColumnDef<ClaimRow>[] = [
  {
    accessorKey: 'billNumber',
    header: 'ID Factura',
    enableSorting: true
  },
  {
    accessorKey: 'products',
    header: 'Productos',
    enableSorting: false,
    cell: ({ getValue }) => {
      const products = getValue() as ClaimRow['products'];
      return (
        <span className="text-sm">
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </span>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    enableSorting: true,
    cell: ({ getValue }) => {
      const description = getValue() as string;
      return (
        <span className="text-sm line-clamp-2" title={description}>
          {description}
        </span>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    enableSorting: true,
    cell: ({ getValue }) => {
      const status = getValue() as ClaimRow['status'];
      const statusColors: Record<string, string> = {
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'En revisión': 'bg-blue-100 text-blue-800',
        'Resuelto': 'bg-green-100 text-green-800',
        'Rechazado': 'bg-red-100 text-red-800'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha Creación',
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }
];

