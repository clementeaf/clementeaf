import { type ColumnDef } from '@tanstack/react-table';
import type { ProductRow } from './columns';

/**
 * Definición de columnas para la tabla de productos
 */
export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: 'name',
    header: 'Producto',
    enableSorting: true
  },
  {
    accessorKey: 'quantity',
    header: 'Cantidad',
    enableSorting: true,
    cell: ({ getValue }) => {
      const quantity = getValue() as number;
      return quantity.toLocaleString('es-CL');
    }
  },
  {
    accessorKey: 'unitPrice',
    header: 'Precio Unitario',
    enableSorting: true,
    cell: ({ getValue }) => {
      const price = getValue() as number;
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(price);
    }
  },
  {
    accessorKey: 'total',
    header: 'Total',
    enableSorting: true,
    cell: ({ getValue }) => {
      const total = getValue() as number;
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(total);
    }
  },
  {
    accessorKey: 'certificacion',
    header: 'Certificación',
    enableSorting: true,
    cell: ({ getValue }) => {
      const certificacion = getValue() as boolean;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          certificacion
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {certificacion ? 'Sí' : 'No'}
        </span>
      );
    }
  },
  {
    accessorKey: 'capacitacion',
    header: 'Capacitación',
    enableSorting: true,
    cell: ({ getValue }) => {
      const capacitacion = getValue() as boolean;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          capacitacion
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {capacitacion ? 'Sí' : 'No'}
        </span>
      );
    }
  }
];

