import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '../../components/commons';
import { usersService, type User } from '../../services/usersService';
import { rolesService, type Role } from '../../services/rolesService';
import { toast } from 'react-toastify';
import { Input, Select } from '../../components/commons';
import { routes } from '../../routes';

/**
 * Mantenedor de Usuarios
 * Permite asignar roles a usuarios del sistema
 * @returns Componente UsersManagement
 */
export const UsersManagement = (): React.ReactElement => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  /**
   * Carga los datos iniciales
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga usuarios y roles
   */
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getAllUsers(1, 1000),
        rolesService.getAllRoles()
      ]);
      setUsers(usersData.data);
      setRoles(rolesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
      toast.error(errorMessage);
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la selección de un usuario para editar su rol
   */
  const handleSelectUser = (user: User): void => {
    setSelectedUser(user);
    setSelectedRoleId(user.roleId || null);
  };

  /**
   * Navega a la página de creación de usuario
   */
  const handleCreateUser = (): void => {
    navigate(routes.createUser);
  };

  /**
   * Guarda el rol asignado al usuario
   */
  const handleSaveUserRole = async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }

    try {
      await usersService.updateUserRole(selectedUser.id, selectedRoleId);
      toast.success('Rol actualizado exitosamente');
      await loadData();
      setSelectedUser(null);
      setSelectedRoleId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar rol';
      toast.error(errorMessage);
      console.error('Error updating user role:', error);
    }
  };


  /**
   * Filtra usuarios por término de búsqueda
   */
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.name?.toLowerCase().includes(search) ?? false)
    );
  });

  return (
    <div className="w-full h-full p-8">
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios y asignación de roles"
      />
      <div className="mb-6 flex gap-4">
        <Input
          id="search-users"
          type="text"
          placeholder="Buscar usuarios por email o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          inputClassName="flex-1"
        />
        <Button
          onClick={handleCreateUser}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Crear Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Usuarios {!isLoading && `(${filteredUsers.length})`}
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{user.name || 'Sin nombre'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="mt-2">
                        {user.role ? (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {user.role.name}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            Sin rol asignado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Formulario de Asignación de Rol */}
        {selectedUser && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Asignar Rol</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedUser.name || 'Sin nombre'}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <Select
                  id="user-role"
                  value={selectedRoleId?.toString() || ''}
                  onChange={(e) => setSelectedRoleId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  options={[
                    { value: '', label: 'Sin rol' },
                    ...roles.map(role => ({
                      value: role.id.toString(),
                      label: role.name
                    }))
                  ]}
                />
                {selectedRoleId && (
                  <p className="text-xs text-gray-500 mt-1">
                    {roles.find(r => r.id === selectedRoleId)?.description || ''}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveUserRole}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedRoleId(null);
                  }}
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

