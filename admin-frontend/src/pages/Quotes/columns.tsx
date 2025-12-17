import { type ColumnDef } from '@tanstack/react-table';
import type { ChangeEvent } from 'react';
import { Checkbox } from '../../components/commons';
import { DocumentIcon, EyeIcon, MoreOptionsIcon } from '../../components/commons/icons';

/**
 * Tipo de datos para una fila de orden de compra
 */
export interface QuoteRow {
  id: string;
  clienteNombre: string;
  numeroCotizacion: string;
  fecha: string;
  estado: string;
  estadoPicking?: string | null;
}

/**
 * Acciones disponibles en la tabla de órdenes de compra
 */
export interface QuoteTableActions {
  onDelete: (row: QuoteRow) => void;
}

/**
 * Definición de columnas para la tabla de órdenes de compra
 */
export const getQuoteColumns = (actions: QuoteTableActions): ColumnDef<QuoteRow>[] => [
  {
    id: 'select',
    header: ({ table }) => {
      const handler = table.getToggleAllRowsSelectedHandler();
      return (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={(e) => {
            const event = e as unknown as ChangeEvent<HTMLInputElement>;
            handler(event);
          }}
        />
      );
    },
    cell: ({ row }) => {
      const handler = row.getToggleSelectedHandler();
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(e) => {
            const event = e as unknown as ChangeEvent<HTMLInputElement>;
            handler(event);
          }}
        />
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'clienteNombre',
    header: 'Cliente',
    enableSorting: true
  },
  {
    accessorKey: 'numeroCotizacion',
    header: 'N° Orden de compra',
    enableSorting: true
  },
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    enableSorting: true
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    enableSorting: true,
    cell: ({ row }) => {
      const estadoPicking = row.original.estadoPicking ?? null;
      if (estadoPicking === 'iniciado' || estadoPicking === 'recolectado') return 'Picking';
      if (estadoPicking === 'confirmado') return 'Confirmada';
      if (estadoPicking === 'en_ruta') return 'Despachada';
      // legacy
      if (row.original.estado === 'Picking') return 'Picking';
      if (row.original.estado === 'Confirmación') return 'Confirmada';
      if (row.original.estado === 'Despachado') return 'Despachada';
      return row.original.estado;
    }
  },
  {
    id: 'actions',
    header: 'Documento',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-end">
        <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
          <DocumentIcon color="#6B7280" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
          <EyeIcon color="#6B7280" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            actions.onDelete(row.original);
          }}
          className="px-2 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          Eliminar
        </button>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
          <MoreOptionsIcon color="#6B7280" />
        </button>
      </div>
    ),
    enableSorting: false
  }
];

