import { type ColumnDef } from '@tanstack/react-table';

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
}

/**
 * Definición de columnas para la tabla de facturas
 */
export const columns: ColumnDef<BillRow>[] = [
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

