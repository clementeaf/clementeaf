import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/commons';
import { rolesService, permissionsService, type Role, type Permission, type Capability, type CreateRoleDto, type UpdateRoleDto } from '../../services/rolesService';
import { toast } from 'react-toastify';

/**
 * Mantenedor de Roles
 * Permite crear, editar y eliminar roles, y asignar permisos a cada rol
 * @returns Componente RolesManagement
 */
export const RolesManagement = (): React.ReactElement => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    permissionIds: number[];
  }>({
    name: '',
    description: '',
    permissionIds: []
  });

  /**
   * Carga los datos iniciales
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga roles, permisos y capacidades
   */
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [rolesData, permissionsData, capabilitiesData] = await Promise.all([
        rolesService.getAllRoles(),
        permissionsService.getAllPermissions(),
        permissionsService.getAvailableCapabilities()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
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
   * Sincroniza permisos desde las capacidades descubiertas
   */
  const handleSyncPermissions = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      const syncedPermissions = await permissionsService.syncPermissions();
      setPermissions(syncedPermissions);
      toast.success('Permisos sincronizados exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al sincronizar permisos';
      toast.error(errorMessage);
      console.error('Error syncing permissions:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Inicia la creación de un nuevo rol
   */
  const handleCreateNew = (): void => {
    setSelectedRole(null);
    setIsCreating(true);
    setFormData({
      name: '',
      description: '',
      permissionIds: []
    });
  };

  /**
   * Inicia la edición de un rol existente
   */
  const handleEdit = (role: Role): void => {
    setSelectedRole(role);
    setIsCreating(false);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.rolePermissions?.map(rp => rp.permission.id) || []
    });
  };

  /**
   * Cancela la edición/creación
   */
  const handleCancel = (): void => {
    setSelectedRole(null);
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      permissionIds: []
    });
  };

  /**
   * Guarda el rol (crear o actualizar)
   */
  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre del rol es requerido');
        return;
      }

      if (isCreating) {
        const createDto: CreateRoleDto = {
          name: formData.name,
          description: formData.description || undefined,
          permissionIds: formData.permissionIds
        };
        await rolesService.createRole(createDto);
        toast.success('Rol creado exitosamente');
      } else if (selectedRole) {
        const updateDto: UpdateRoleDto = {
          name: formData.name,
          description: formData.description || undefined,
          permissionIds: formData.permissionIds
        };
        await rolesService.updateRole(selectedRole.id, updateDto);
        toast.success('Rol actualizado exitosamente');
      }

      await loadData();
      handleCancel();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar rol';
      toast.error(errorMessage);
      console.error('Error saving role:', error);
    }
  };

  /**
   * Elimina un rol
   */
  const handleDelete = async (roleId: number): Promise<void> => {
    if (!window.confirm('¿Está seguro de eliminar este rol?')) {
      return;
    }

    try {
      await rolesService.deleteRole(roleId);
      toast.success('Rol eliminado exitosamente');
      await loadData();
      if (selectedRole?.id === roleId) {
        handleCancel();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar rol';
      toast.error(errorMessage);
      console.error('Error deleting role:', error);
    }
  };

  /**
   * Maneja el cambio de checkbox de permiso
   */
  const handlePermissionToggle = (permissionId: number): void => {
    setFormData(prev => {
      const isSelected = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: isSelected
          ? prev.permissionIds.filter(id => id !== permissionId)
          : [...prev.permissionIds, permissionId]
      };
    });
  };

  /**
   * Agrupa permisos por categoría
   */
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const category = permission.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8">
      <PageHeader
        title="Roles"
        subtitle="Mantenedor de roles y asignación de permisos"
      />

      <div className="mt-6 flex gap-4 mb-6">
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Nuevo Rol
        </button>
        <button
          onClick={handleSyncPermissions}
          disabled={isSyncing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Permisos'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Roles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Roles Existentes</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay roles creados</p>
            ) : (
              roles.map(role => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleEdit(role)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{role.name}</h3>
                      {role.description && (
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {role.rolePermissions?.length || 0} permisos asignados
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(role);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(role.id);
                        }}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Formulario de Rol */}
        {(isCreating || selectedRole) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Crear Nuevo Rol' : 'Editar Rol'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Administrador, Vendedor, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción del rol..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permisos
                </label>
                <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {Object.keys(permissionsByCategory).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay permisos disponibles. Haz clic en "Sincronizar Permisos" para descubrir capacidades.
                    </p>
                  ) : (
                    Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2 pl-4">
                          {categoryPermissions.map(permission => (
                            <label
                              key={permission.id}
                              className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissionIds.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{permission.name}</span>
                                {permission.description && (
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

