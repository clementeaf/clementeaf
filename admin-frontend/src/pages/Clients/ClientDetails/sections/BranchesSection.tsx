import { useState } from 'react';
import { useBranches, useDeleteBranch } from '../../../../hooks/useBranches';
import { useBranchesWebSocket } from '../../../../hooks/useBranchesWebSocket';
import { BranchModal } from '../BranchModal';
import type { Branch } from '../../../../services/branchesService';
import { Button } from '../../../../components/commons';
import { toast } from 'react-toastify';

/**
 * Props del componente BranchesSection
 */
interface BranchesSectionProps {
  /**
   * ID del cliente
   */
  clientId: number;
}

/**
 * Sección de sucursales del cliente
 * @param props - Props del componente BranchesSection
 * @returns Componente BranchesSection
 */
export const BranchesSection = ({ clientId }: BranchesSectionProps): React.ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: branchesData, isLoading } = useBranches(clientId, false);
  const branches = branchesData?.data || [];

  const deleteBranchMutation = useDeleteBranch();

  // WebSocket para eventos de sucursales
  useBranchesWebSocket({
    clientId,
    onBranchCreated: () => {
      // La invalidación de queries se hace automáticamente en el hook
    },
    onBranchUpdated: () => {
      // La invalidación de queries se hace automáticamente en el hook
    },
    onBranchDeleted: () => {
      // La invalidación de queries se hace automáticamente en el hook
    }
  });

  /**
   * Maneja la apertura del modal para crear nueva sucursal
   */
  const handleAddBranch = (): void => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  /**
   * Maneja la apertura del modal para editar sucursal
   */
  const handleEditBranch = (branch: Branch): void => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  /**
   * Maneja el cierre del modal
   */
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  /**
   * Maneja la eliminación de una sucursal
   */
  const handleDeleteBranch = async (branch: Branch): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la sucursal "${branch.nombre}"?`)) {
      return;
    }

    try {
      await deleteBranchMutation.mutateAsync({ clientId, branchId: branch.id });
      toast.success('Sucursal eliminada exitosamente');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                          (error as { message?: string })?.message || 
                          'Error al eliminar la sucursal';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 pb-2">Sucursales</h3>
        <div className="text-center py-12 text-gray-500">
          <p>Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Sucursales</h3>
        <Button
          onClick={handleAddBranch}
          className="bg-[#004BB7] text-white hover:bg-[#003a94] px-4 py-2 text-sm"
        >
          Añadir Sucursal
        </Button>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay sucursales registradas</p>
          <Button
            onClick={handleAddBranch}
            className="mt-4 text-[#004BB7] hover:text-[#003a94] text-sm font-medium"
          >
            Añadir sucursal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">{branch.nombre}</h4>
                  
                  {branch.direccion && (
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Dirección:</span> {branch.direccion}
                      {branch.comuna && `, ${branch.comuna}`}
                      {branch.region && `, ${branch.region}`}
                      {branch.codigoPostal && ` (${branch.codigoPostal})`}
                    </div>
                  )}

                  {(branch.contactoNombre || branch.contactoTelefono || branch.contactoEmail) && (
                    <div className="text-sm text-gray-600 mt-2">
                      {branch.contactoNombre && (
                        <div>
                          <span className="font-medium">Contacto:</span> {branch.contactoNombre}
                        </div>
                      )}
                      {branch.contactoTelefono && (
                        <div>
                          <span className="font-medium">Teléfono:</span> {branch.contactoTelefono}
                        </div>
                      )}
                      {branch.contactoEmail && (
                        <div>
                          <span className="font-medium">Email:</span>{' '}
                          <a
                            href={`mailto:${branch.contactoEmail}`}
                            className="text-[#004BB7] hover:underline"
                          >
                            {branch.contactoEmail}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleEditBranch(branch)}
                    className="px-3 py-1.5 text-sm text-[#004BB7] hover:bg-blue-50 border border-[#004BB7]"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteBranch(branch)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-600"
                    disabled={deleteBranchMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clientId={clientId}
        branch={editingBranch}
        onSuccess={() => {
          // El hook ya invalida las queries automáticamente
        }}
      />
    </div>
  );
};
