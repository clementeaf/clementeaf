import React, { useState } from 'react';
import { Table } from '../../../components/commons';
import { Button, PlusIcon } from '../../../components/commons';
import { columns } from './columns';
import { EmailModuleModal } from './EmailModuleModal';
import type { EmailModuleAccess } from './types';

/**
 * Datos de ejemplo para la tabla (sin funcionalidad por ahora)
 */
const mockData: EmailModuleAccess[] = [
  {
    id: '1',
    email: 'usuario1@ejemplo.com',
    mode: 'ventas',
    invitationSent: false
  },
  {
    id: '2',
    email: 'usuario2@ejemplo.com',
    mode: 'bodega',
    invitationSent: true,
    invitationSentAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'admin@ejemplo.com',
    mode: 'admin',
    invitationSent: false
  }
];

/**
 * Página de Administración de Soporte
 * Visible únicamente para usuarios autorizados
 * @returns Componente SupportAdmin
 */
export const SupportAdmin = (): React.ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmailAccess, setEditingEmailAccess] = useState<EmailModuleAccess | null>(null);
  const [emailAccessList, setEmailAccessList] = useState<EmailModuleAccess[]>(mockData);

  /**
   * Maneja la apertura del modal para agregar un nuevo email
   */
  const handleAddEmail = (): void => {
    setEditingEmailAccess(null);
    setIsModalOpen(true);
  };

  /**
   * Maneja la edición de un email existente
   */
  const handleEditEmail = (emailAccess: EmailModuleAccess): void => {
    setEditingEmailAccess(emailAccess);
    setIsModalOpen(true);
  };

  /**
   * Maneja el guardado de un email (agregar o editar)
   */
  const handleSaveEmail = (
    emailAccessData: Omit<EmailModuleAccess, 'id' | 'invitationSent' | 'invitationSentAt'>
  ): void => {
    if (editingEmailAccess) {
      // Editar existente
      setEmailAccessList((prev) =>
        prev.map((item) =>
          item.id === editingEmailAccess.id
            ? { ...item, ...emailAccessData }
            : item
        )
      );
    } else {
      // Agregar nuevo
      const newEmailAccess: EmailModuleAccess = {
        id: String(Date.now()),
        ...emailAccessData,
        invitationSent: false
      };
      setEmailAccessList((prev) => [...prev, newEmailAccess]);
    }
  };

  /**
   * Maneja el envío de invitación
   */
  const handleSendInvitation = (emailAccess: EmailModuleAccess): void => {
    // TODO: Implementar funcionalidad de envío de invitación
    setEmailAccessList((prev) =>
      prev.map((item) =>
        item.id === emailAccess.id
          ? {
              ...item,
              invitationSent: true,
              invitationSentAt: new Date().toISOString()
            }
          : item
      )
    );
  };

  /**
   * Actualiza las columnas para pasar las funciones de edición y envío
   */
  const columnsWithActions = columns.map((column) => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: { row: { original: EmailModuleAccess } }) => {
          return (
            <div className="flex items-center gap-2 h-full">
              <Button
                onClick={() => handleEditEmail(row.original)}
                className="text-[#004BB7] border border-[#004BB7] hover:bg-blue-50 px-3 py-1 text-sm whitespace-nowrap"
              >
                Editar
              </Button>
              <Button
                onClick={() => handleSendInvitation(row.original)}
                className="bg-[#004BB7] text-white hover:bg-blue-600 px-3 py-1 text-sm whitespace-nowrap"
              >
                {row.original.invitationSent ? 'Reenviar' : 'Enviar Invitación'}
              </Button>
            </div>
          );
        }
      };
    }
    return column;
  });

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Administración de Soporte</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestión de acceso de emails a modos del sistema (Ventas, Bodega, Admin General)
            </p>
          </div>
          <Button
            onClick={handleAddEmail}
            className="bg-[#004BB7] text-white hover:bg-blue-600 px-4 py-2 flex items-center gap-2"
            leftIcon={<PlusIcon />}
          >
            Agregar Email
          </Button>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto p-6">
          <Table<EmailModuleAccess>
            data={emailAccessList}
            columns={columnsWithActions}
            enableSorting={true}
            containerClassName="w-full"
            tableClassName="w-full border-collapse"
            theadClassName="bg-gray-50 sticky top-0"
            headerRowClassName="border-b border-gray-200"
            headerCellClassName="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider align-middle"
            bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
            bodyCellClassName="px-4 py-3 text-sm text-gray-900 align-middle"
          />
        </div>
      </div>

      {/* Modal para agregar/editar email */}
      <EmailModuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmailAccess(null);
        }}
        emailAccess={editingEmailAccess}
        onSave={handleSaveEmail}
      />
    </div>
  );
};

