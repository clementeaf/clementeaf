import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '../../../components/commons';
import type { EmailModuleAccess } from './types';
import { availableModules } from './modulesConfig';

/**
 * Definición de columnas para la tabla de gestión de emails y módulos
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
    id: 'modules',
    header: 'Módulos Asignados',
    enableSorting: false,
    cell: ({ row }) => {
      const { modules, subModules } = row.original;
      const assignedModules = availableModules.filter(m => modules.includes(m.id));
      
      return (
        <div className="flex flex-wrap gap-2">
          {assignedModules.map((module) => {
            const moduleSubModules = module.subModules?.filter(sm => subModules.includes(sm.id)) || [];
            const hasSubModules = moduleSubModules.length > 0;
            
            return (
              <div key={module.id} className="flex flex-col gap-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {module.name}
                </span>
                {hasSubModules && (
                  <div className="flex flex-wrap gap-1 ml-2">
                    {moduleSubModules.map((subModule) => (
                      <span
                        key={subModule.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {subModule.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {assignedModules.length === 0 && (
            <span className="text-sm text-gray-400">Sin módulos asignados</span>
          )}
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

