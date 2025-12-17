import type { ColumnDef } from '@tanstack/react-table';
import type { AccountingOverviewRow } from '../../services/accountingService';

export interface AccountingTableActions {
  onOpenInvoiceModal: (row: AccountingOverviewRow) => void;
}

/**
 * Columnas de Contabilidad.
 * @param actions - Acciones disponibles desde la tabla
 */
export const getAccountingColumns = (actions: AccountingTableActions): ColumnDef<AccountingOverviewRow>[] => [
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

      const label = status === 'pendiente_factura' ? 'Pendiente de facturar' : 'Pendiente';

      return (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            actions.onOpenInvoiceModal(row.original);
          }}
          className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200"
        >
          {label}
        </button>
      );
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


