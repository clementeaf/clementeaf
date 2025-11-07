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
  }
];

