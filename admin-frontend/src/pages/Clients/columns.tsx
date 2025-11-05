import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '../../components/commons';
import { DocumentIcon, EyeIcon, MoreOptionsIcon } from '../../components/commons/icons';

/**
 * Tipo de datos para una fila de cliente
 */
export interface ClientRow {
  id: string;
  fantasyName: string;
  rut: string;
  segment: string;
}

/**
 * Definición de columnas para la tabla de clientes
 */
export const columns: ColumnDef<ClientRow>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const handler = table.getToggleAllRowsSelectedHandler();
      return (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={(e) => {
            const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
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
            const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
            handler(event);
          }}
        />
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'fantasyName',
    header: 'Nom. Fantasía/Razón social',
    enableSorting: true
  },
  {
    accessorKey: 'rut',
    header: 'RUT',
    enableSorting: true
  },
  {
    accessorKey: 'segment',
    header: 'Segmento/ Subsegmento',
    enableSorting: true
  },
  {
    id: 'actions',
    header: 'Documento',
    cell: () => (
      <div className="flex items-center gap-2">
        <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
          <DocumentIcon color="#6B7280" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
          <EyeIcon color="#6B7280" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
          <MoreOptionsIcon color="#6B7280" />
        </button>
      </div>
    ),
    enableSorting: false
  }
];

