import type { ColumnDef } from '@tanstack/react-table';
import type { AccountingOverviewRow } from '../../services/accountingService';

export const accountingColumns: ColumnDef<AccountingOverviewRow>[] = [
  {
    accessorKey: 'quote.numeroCotizacion',
    header: 'NOTA',
    cell: ({ row }) => {
      const q = row.original.quote;
      return q.numeroCotizacion && q.numeroCotizacion.length > 0 ? q.numeroCotizacion : `Q-${q.id}`;
    }
  },
  {
    accessorKey: 'quote.clienteNombre',
    header: 'CLIENTE',
    cell: ({ row }) => row.original.quote.clienteNombre
  },
  {
    accessorKey: 'quote.estadoPicking',
    header: 'PICKING',
    cell: ({ row }) => row.original.quote.estadoPicking ?? '-'
  },
  {
    accessorKey: 'invoice.invoiceNumber',
    header: 'FACTURA',
    cell: ({ row }) => {
      const status = row.original.accountingStatus ?? 'no_aplica';
      if (row.original.invoice?.invoiceNumber) return row.original.invoice.invoiceNumber;
      if (status === 'pendiente_factura') return 'Pendiente de facturar';
      return 'Pendiente';
    }
  },
  {
    accessorKey: 'invoice.totalAmount',
    header: 'TOTAL FACTURA',
    cell: ({ row }) => {
      const total = row.original.invoice?.totalAmount ?? 0;
      return total > 0 ? `$${total.toLocaleString('es-CL')}` : '-';
    }
  },
  {
    accessorKey: 'warehouse.inventoryValue',
    header: 'HABERES (BODEGA)',
    cell: ({ row }) => {
      const val = row.original.warehouse?.inventoryValue ?? null;
      return val === null ? '-' : `$${val.toLocaleString('es-CL')}`;
    }
  }
];


