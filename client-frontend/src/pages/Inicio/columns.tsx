import { type ColumnDef } from '@tanstack/react-table';

/**
 * Tipo de datos para un producto
 */
export interface ProductRow {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Tipo de datos para una fila de factura
 */
export interface BillRow {
  id: string;
  number: string;
  date: string;
  client: string;
  amount: number;
  status: string;
  products: ProductRow[];
}

/**
 * Definición de columnas para la tabla de facturas
 */
export const columns: ColumnDef<BillRow>[] = [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) => {
      return (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
          aria-label={row.getIsExpanded() ? 'Colapsar' : 'Expandir'}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              row.getIsExpanded() ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'number',
    header: 'Número',
    enableSorting: true
  },
  {
    accessorKey: 'date',
    header: 'Fecha',
    enableSorting: true
  },
  {
    accessorKey: 'client',
    header: 'Cliente',
    enableSorting: true
  },
  {
    accessorKey: 'amount',
    header: 'Monto',
    enableSorting: true,
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(amount);
    }
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    enableSorting: true,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusColors: Record<string, string> = {
        'Pagada': 'bg-green-100 text-green-800',
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'Vencida': 'bg-red-100 text-red-800'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      );
    }
  }
];

