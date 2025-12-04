import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/commons';
import { permissionsService, type Permission, type Capability } from '../../services/rolesService';
import { toast } from 'react-toastify';

/**
 * Mantenedor de Permisos
 * Visualiza y sincroniza permisos del sistema
 * @returns Componente PermissionsManagement
 */
export const PermissionsManagement = (): React.ReactElement => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  /**
   * Carga los datos iniciales
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga permisos y capacidades
   */
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [permissionsData, capabilitiesData] = await Promise.all([
        permissionsService.getAllPermissions(),
        permissionsService.getAvailableCapabilities()
      ]);
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
   * Filtra permisos por término de búsqueda y categoría
   */
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !searchTerm || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesCategory = !selectedCategory || permission.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  /**
   * Obtiene categorías únicas
   */
  const categories = Array.from(new Set(permissions.map(p => p.category))).sort();

  /**
   * Agrupa permisos por categoría
   */
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
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
        title="Permisos"
        subtitle="Visualización y sincronización de permisos del sistema"
      />
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleSyncPermissions}
          disabled={isSyncing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Permisos desde Capacidades'}
        </button>
        <div className="text-sm text-gray-600 flex items-center">
          {permissions.length} permisos sincronizados • {capabilities.length} capacidades disponibles
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {Object.keys(permissionsByCategory).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm || selectedCategory 
                ? 'No se encontraron permisos con los filtros aplicados' 
                : 'No hay permisos sincronizados. Haz clic en "Sincronizar Permisos" para descubrir capacidades.'}
            </p>
          ) : (
            Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryPermissions.map(permission => (
                    <div
                      key={permission.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{permission.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 font-mono">{permission.code}</p>
                          {permission.description && (
                            <p className="text-sm text-gray-600 mt-2">{permission.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {permission.resource && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {permission.resource}
                              </span>
                            )}
                            {permission.action && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                {permission.action}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

