import { type ColumnDef } from '@tanstack/react-table';
import type { Product } from '../../services/productsService';

/**
 * Columnas de la tabla de productos
 */
export interface ProductTableActions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Construye columnas de productos incluyendo acciones
 * @param actions - Callbacks y flags de permisos
 * @returns Columnas para la tabla
 */
export const getProductColumns = (actions: ProductTableActions): ColumnDef<Product>[] => [
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
    accessorKey: 'descontinuado',
    header: 'Estado',
    cell: ({ row }) => {
      const discontinued = Boolean(row.original.descontinuado);
      return (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            discontinued ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {discontinued ? 'Descontinuado' : 'Activo'}
        </span>
      );
    },
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
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const product = row.original;
      const stop = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        e.stopPropagation();
      };

      return (
        <div className="flex justify-end gap-2">
          {actions.canEdit && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                actions.onEdit(product);
              }}
              className="px-3 py-1 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Editar
            </button>
          )}
          {actions.canDelete && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                actions.onDelete(product);
              }}
              className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      );
    },
    size: 120
  }
];

