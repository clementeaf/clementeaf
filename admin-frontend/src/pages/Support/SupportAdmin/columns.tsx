import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '../../../components/commons';
import type { EmailModuleAccess } from './types';
import { availableModes } from './modesConfig';

/**
 * Definición de columnas para la tabla de gestión de emails y modos de acceso
 */
export const columns: ColumnDef<EmailModuleAccess>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-900">
          {row.original.email}
        </div>
      );
    }
  },
  {
    id: 'mode',
    header: 'Modo de Acceso',
    enableSorting: true,
    cell: ({ row }) => {
      const { mode } = row.original;
      const modeConfig = availableModes.find(m => m.id === mode);
      
      if (!modeConfig) {
        return (
          <span className="text-sm text-gray-400">Sin modo asignado</span>
        );
      }
      
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {modeConfig.name}
          </span>
          <span className="text-xs text-gray-500">
            {modeConfig.description}
          </span>
        </div>
      );
    }
  },
  {
    id: 'invitationStatus',
    header: 'Estado de Invitación',
    enableSorting: true,
    cell: ({ row }) => {
      const { invitationSent, invitationSentAt } = row.original;
      
      if (invitationSent) {
        return (
          <div className="flex flex-col">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
              Enviada
            </span>
            {invitationSentAt && (
              <span className="text-xs text-gray-500 mt-1">
                {new Date(invitationSentAt).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      }
      
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
          Pendiente
        </span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    enableSorting: false,
    cell: ({ row }) => {
      // Las acciones se manejan en el componente principal
      // Este es solo un placeholder que será reemplazado
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Acciones</span>
        </div>
      );
    }
  }
];

