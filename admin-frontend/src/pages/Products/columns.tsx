import { type ColumnDef } from '@tanstack/react-table';
import type { Product } from '../../services/productsService';

/**
 * Columnas de la tabla de productos
 */
export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">{row.original.codigo}</div>
    ),
    size: 120
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre del Producto',
    cell: ({ row }) => (
      <div className="text-gray-900 font-medium">{row.original.nombre}</div>
    ),
    size: 300
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <div className="text-gray-600 text-sm">{row.original.sku || '-'}</div>
    ),
    size: 120
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.original.stock || 0;
      return (
        <div className="flex items-center gap-2">
          <div className={`font-semibold ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock}
          </div>
          {stock > 0 && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
      );
    },
    size: 100
  },
  {
    accessorKey: 'precio',
    header: 'Precio',
    cell: ({ row }) => {
      const precio = row.original.precio;
      return (
        <div className="text-gray-900 font-medium">
          {precio ? `$${precio.toLocaleString('es-CL')}` : '-'}
        </div>
      );
    },
    size: 120
  },
  {
    accessorKey: 'categoria',
    header: 'Categoría',
    cell: ({ row }) => (
      <div className="text-gray-600 text-sm">{row.original.categoria || '-'}</div>
    ),
    size: 150
  },
  {
    accessorKey: 'marca',
    header: 'Marca',
    cell: ({ row }) => (
      <div className="text-gray-600 text-sm">{row.original.marca || '-'}</div>
    ),
    size: 120
  }
];

