import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/commons';
import { Button } from '../../components/commons';
import { Input } from '../../components/commons';
import { Modal } from '../../components/commons';

import { dynamicRolesService, type CreateDynamicRoleDto } from '../../services/dynamicRolesService';
import { permissionsService, type Capability } from '../../services/rolesService';
import { toast } from 'react-toastify';

interface DynamicRole {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystemRole: boolean;
  moduleScopes: string[] | null;
  canDelegatePermissions: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DynamicRoleManagement = (): React.ReactElement => {
  // const navigate = useNavigate();
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DynamicRole | null>(null);
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<Omit<CreateDynamicRoleDto, 'capabilities'>>({
    name: '',
    description: '',
    moduleScopes: [],
    canDelegatePermissions: false
  });
  
  const [selectedCapabilities, setSelectedCapabilities] = useState<Array<{module: string, action: string, allowed: boolean}>>([]);

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga roles y capacidades disponibles
   */
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [rolesData, capabilitiesData] = await Promise.all([
        dynamicRolesService.getDynamicRoles(),
        permissionsService.getAvailableCapabilities()
      ]);
      
      setRoles(rolesData);
      setCapabilities(capabilitiesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
      toast.error(errorMessage);
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la creación de un nuevo rol
   */
  const handleCreateRole = async (): Promise<void> => {
    if (!formData.name.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    try {
      setIsCreating(true);
      
      // Preparar capacidades seleccionadas
      const capabilities = selectedCapabilities.map(cap => ({
        module: cap.module,
        action: cap.action,
        allowed: cap.allowed
      }));
      
      await dynamicRolesService.createDynamicRole({
        ...formData,
        capabilities
      });
      
      toast.success('Rol creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear rol';
      toast.error(errorMessage);
      console.error('Error creating role:', error);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Maneja la edición de un rol
   */
  const handleEditRole = (role: DynamicRole): void => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      moduleScopes: role.moduleScopes || [],
      canDelegatePermissions: role.canDelegatePermissions
    });
    setShowCreateModal(true);
  };

  /**
   * Maneja la actualización de un rol
   */
  const handleUpdateRole = async (): Promise<void> => {
    if (!selectedRole || !formData.name.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    try {
      await dynamicRolesService.updateDynamicRole(selectedRole.id, {
        ...formData
      });
      
      toast.success('Rol actualizado exitosamente');
      setShowCreateModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar rol';
      toast.error(errorMessage);
      console.error('Error updating role:', error);
    }
  };

  /**
   * Maneja la eliminación de un rol
   */
  const handleDeleteRole = async (roleId: number, roleName: string): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de eliminar el rol "${roleName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await dynamicRolesService.deleteDynamicRole(roleId);
      toast.success('Rol eliminado exitosamente');
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar rol';
      toast.error(errorMessage);
      console.error('Error deleting role:', error);
    }
  };

  /**
   * Abre el modal de gestión de capacidades
   */
  const handleManageCapabilities = (role: DynamicRole): void => {
    setSelectedRole(role);
    // Aquí cargaríamos las capacidades actuales del rol
    setShowCapabilitiesModal(true);
  };

  /**
   * Resetea el formulario
   */
  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      moduleScopes: [],
      canDelegatePermissions: false
    });
    setSelectedRole(null);
    setSelectedCapabilities([]);
  };

  /**
   * Agrupa capacidades por módulo
   */
  const groupedCapabilities = capabilities.reduce((acc, cap) => {
    const module = cap.category || 'General';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(cap);
    return acc;
  }, {} as Record<string, Capability[]>);

  return (
    <div className="w-full h-full p-8">
      <PageHeader
        title="Gestión de Roles Dinámicos"
        actionButtons={[
          {
            label: 'Crear Rol Dinámico',
            onClick: () => setShowCreateModal(true),
            variant: 'primary'
          }
        ]}
      />

      {/* Lista de Roles */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-6 bg-white rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay roles dinámicos creados</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
            >
              Crear tu primer rol
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    )}
                  </div>
                  {role.isSystemRole && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Sistema
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Estado:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {role.moduleScopes && role.moduleScopes.length > 0 && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-2">Módulos:</span>
                      <div className="flex flex-wrap gap-1">
                        {role.moduleScopes.map((scope) => (
                          <span key={scope} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Delegación:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.canDelegatePermissions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {role.canDelegatePermissions ? 'Permitida' : 'Denegada'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => handleEditRole(role)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => handleManageCapabilities(role)}
                  >
                    Capacidades
                  </button>
                  {!role.isSystemRole && (
                    <button
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Creación/Edición */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title={selectedRole ? 'Editar Rol' : 'Crear Rol Dinámico'}
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nombre del rol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción del rol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Módulos con Acceso
            </label>
            <Input
              value={formData.moduleScopes?.join(', ') || ''}
              onChange={(e) => setFormData({
                ...formData, 
                moduleScopes: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              placeholder="picking, ventas, productos (separados por coma)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar vacío para acceso a todos los módulos
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="canDelegate"
              checked={formData.canDelegatePermissions}
              onChange={(e) => setFormData({...formData, canDelegatePermissions: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="canDelegate" className="ml-2 block text-sm text-gray-700">
              Puede delegar permisos (crear subordinados)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={selectedRole ? handleUpdateRole : handleCreateRole}
              disabled={isCreating || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Guardando...' : (selectedRole ? 'Actualizar Rol' : 'Crear Rol')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Gestión de Capacidades */}
      <Modal
        isOpen={showCapabilitiesModal}
        onClose={() => setShowCapabilitiesModal(false)}
        title={`Capacidades de ${selectedRole?.name || 'Rol'}`}
        size="xl"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedCapabilities).map(([module, caps]) => (
            <div key={module} className="border-b border-gray-200 pb-4">
              <h3 className="font-medium text-gray-900 mb-3">{module}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {caps.map((cap) => {
                  const isSelected = selectedCapabilities.some(
                    sc => sc.module === cap.category && sc.action === (cap.action || cap.name)
                  );
                  
                  return (
                    <div key={`${cap.category}-${cap.action || cap.name}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{cap.name}</div>
                        {cap.description && (
                          <div className="text-xs text-gray-500 mt-1">{cap.description}</div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Denegar</label>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCapabilities([
                                ...selectedCapabilities,
                                {
                                  module: cap.category,
                                  action: cap.action || cap.name,
                                  allowed: false
                                }
                              ]);
                            } else {
                              setSelectedCapabilities(
                                selectedCapabilities.filter(
                                  sc => !(sc.module === cap.category && sc.action === (cap.action || cap.name))
                                )
                              );
                            }
                          }}
                          className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <label className="text-sm text-gray-600">Permitir</label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowCapabilitiesModal(false)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Capacidades
            </button>
            <button
              type="button"
              onClick={() => setShowCapabilitiesModal(false)}
              className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
