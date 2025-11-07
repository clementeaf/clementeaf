import { type ColumnDef } from '@tanstack/react-table';
import { DownloadIcon, EyeIcon, InfoIcon } from '../../components/icons';

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
  purchaseDate: string;
  dispatchDate: string;
  amount: number;
  productCount: number;
  paymentDate: string | null;
  paymentStatus: 'Por pagar' | 'Pagado';
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
    header: 'ID Factura',
    enableSorting: true
  },
  {
    accessorKey: 'purchaseDate',
    header: 'Fecha Compra',
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
    accessorKey: 'dispatchDate',
    header: 'Fecha Despacho',
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
    accessorKey: 'amount',
    header: 'Monto ($)',
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
    accessorKey: 'productCount',
    header: 'Cantidad/Volumen',
    enableSorting: true,
    cell: ({ getValue }) => {
      const count = getValue() as number;
      return count.toLocaleString('es-CL');
    }
  },
  {
    accessorKey: 'paymentDate',
    header: 'Fecha Pago',
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = getValue() as string | null;
      if (!date) {
        return '-';
      }
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Estado del Pago',
    enableSorting: true,
    cell: ({ getValue }) => {
      const status = getValue() as 'Por pagar' | 'Pagado';
      const statusColors: Record<string, string> = {
        'Pagado': 'bg-green-100 text-green-800',
        'Por pagar': 'bg-yellow-100 text-yellow-800'
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
    cell: ({ row }) => {
      const handleDownload = (): void => {
        console.log('Descargar factura:', row.original.number);
      };

      const handleView = (): void => {
        console.log('Visualizar factura:', row.original.number);
      };

      const handleDetail = (): void => {
        row.toggleExpanded();
      };

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            aria-label="Descargar factura"
            title="Descargar factura"
          >
            <DownloadIcon color="#6B7280" />
          </button>
          <button
            onClick={handleView}
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            aria-label="Visualizar factura"
            title="Visualizar factura"
          >
            <EyeIcon color="#6B7280" />
          </button>
          <button
            onClick={handleDetail}
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            aria-label="Detalle factura"
            title="Detalle factura"
          >
            <InfoIcon color="#6B7280" />
          </button>
        </div>
      );
    },
    enableSorting: false
  }
];

