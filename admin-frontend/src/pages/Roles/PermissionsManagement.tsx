import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/commons';
import { permissionsService, type Permission, type Capability } from '../../services/rolesService';
import { toast } from 'react-toastify';
import { navItems, sellsSubItems, pickingSubItems, rolesSubItems } from '../../components/Sidebar/navItems.config';
import { routes } from '../../routes';
import toOpenIcon from '../../assets/toOpen.png';
import toCloseIcon from '../../assets/toClose.png';

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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSubModules, setExpandedSubModules] = useState<Set<string>>(new Set());

  /**
   * Carga los datos iniciales
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga permisos y capacidades, sincroniza automáticamente si no hay permisos
   */
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      let permissionsData = await permissionsService.getAllPermissions();
      const capabilitiesData = await permissionsService.getAvailableCapabilities();
      
      // Si no hay permisos, sincronizar automáticamente
      if (permissionsData.length === 0) {
        permissionsData = await permissionsService.syncPermissions();
      }
      
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
   * Obtiene categorías únicas, priorizando "Módulos"
   */
  const categories = Array.from(new Set(permissions.map(p => p.category))).sort((a, b) => {
    if (a === 'Módulos') return -1;
    if (b === 'Módulos') return 1;
    return a.localeCompare(b);
  });

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

  /**
   * Ordena las categorías para mostrar primero "Módulos"
   */
  const sortedCategories = Object.keys(permissionsByCategory).sort((a, b) => {
    if (a === 'Módulos') return -1;
    if (b === 'Módulos') return 1;
    return a.localeCompare(b);
  });

  /**
   * Obtiene los submódulos para un módulo dado
   */
  const getSubItemsForModule = (moduleName: string): typeof sellsSubItems => {
    if (moduleName === 'Ventas') return sellsSubItems;
    if (moduleName === 'Picking') return pickingSubItems;
    if (moduleName === 'Roles') return rolesSubItems;
    return [];
  };

  /**
   * Obtiene el código de permiso para un módulo
   */
  const getModuleCode = (modulePath: string): string => {
    return `module:${modulePath.replace(/^\//, '').replace(/\//g, ':')}`;
  };

  /**
   * Obtiene el código de permiso para un submódulo
   */
  const getSubModuleCode = (subModulePath: string): string => {
    return `view:${subModulePath.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id')}`;
  };

  /**
   * Agrupa permisos de módulos con sus submódulos
   */
  const organizeModulePermissions = (): Array<{
    module: { name: string; path: string; permission?: Permission };
    subModules: Array<{ name: string; path: string; permission?: Permission }>;
  }> => {
    const modulePermissions = permissionsByCategory['Módulos'] || [];
    const organized: Array<{
      module: { name: string; path: string; permission?: Permission };
      subModules: Array<{ name: string; path: string; permission?: Permission }>;
    }> = [];

    navItems.forEach(navItem => {
      if (navItem.path.includes('*')) return; // Excluir wildcards
      
      const moduleCode = getModuleCode(navItem.path);
      const modulePermission = modulePermissions.find(p => p.code === moduleCode);
      
      const subItems = getSubItemsForModule(navItem.name);
      const subModules = subItems
        .filter(item => !item.path.includes('*'))
        .map(subItem => {
          const subModuleCode = getSubModuleCode(subItem.path);
          const subModulePermission = permissions.find(p => p.code === subModuleCode);
          return {
            name: subItem.name,
            path: subItem.path,
            permission: subModulePermission
          };
        });

      organized.push({
        module: {
          name: navItem.name,
          path: navItem.path,
          permission: modulePermission
        },
        subModules
      });
    });

    return organized;
  };

  /**
   * Maneja el toggle de expansión de módulo
   */
  const handleToggleModule = (modulePath: string): void => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modulePath)) {
        newSet.delete(modulePath);
        // Al colapsar el módulo, también colapsar todos sus submódulos
        const moduleName = navItems.find(item => item.path === modulePath)?.name || '';
        const subItems = getSubItemsForModule(moduleName);
        setExpandedSubModules(prevSub => {
          const newSubSet = new Set(prevSub);
          subItems.forEach(subItem => {
            newSubSet.delete(subItem.path);
          });
          return newSubSet;
        });
      } else {
        newSet.add(modulePath);
      }
      return newSet;
    });
  };

  /**
   * Maneja el toggle de expansión de submódulo
   */
  const handleToggleSubModule = (subModulePath: string): void => {
    setExpandedSubModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subModulePath)) {
        newSet.delete(subModulePath);
      } else {
        newSet.add(subModulePath);
      }
      return newSet;
    });
  };

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
          {isSyncing ? 'Sincronizando...' : 'Re-sincronizar Permisos'}
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
          {sortedCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm || selectedCategory 
                ? 'No se encontraron permisos con los filtros aplicados' 
                : 'No hay permisos sincronizados. Haz clic en "Sincronizar Permisos" para descubrir capacidades.'}
            </p>
          ) : (
            sortedCategories.map(category => {
              const categoryPermissions = permissionsByCategory[category];
              const isModuleCategory = category === 'Módulos';
              
              if (isModuleCategory) {
                // Para módulos, mostrar con acordeón
                const organizedModules = organizeModulePermissions();
                
                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 text-blue-700">
                      {category}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Módulos principales del sistema)
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {organizedModules.map(({ module, subModules }) => {
                        const isExpanded = expandedModules.has(module.path);
                        const hasSubModules = subModules.length > 0;
                        
                        return (
                          <div key={module.path} className="border border-blue-200 bg-blue-50 rounded-lg">
                            <div
                              className={`flex items-center justify-between p-4 hover:bg-blue-100 transition-colors ${
                                hasSubModules ? 'cursor-pointer' : 'cursor-default'
                              }`}
                              onClick={() => hasSubModules && handleToggleModule(module.path)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  {hasSubModules && (
                                    <img
                                      src={isExpanded ? toCloseIcon : toOpenIcon}
                                      alt={isExpanded ? 'Cerrar' : 'Abrir'}
                                      className="w-5 h-5 transition-transform flex-shrink-0"
                                    />
                                  )}
                                  <h4 className="font-medium text-blue-900">
                                    {module.name}
                                  </h4>
                                </div>
                                {module.permission && (
                                  <>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">{module.permission.code}</p>
                                    {module.permission.description && (
                                      <p className="text-sm text-gray-600 mt-2">{module.permission.description}</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Submódulos */}
                            {hasSubModules && isExpanded && (
                              <div className="border-t border-blue-200 bg-white">
                                {subModules.map(subModule => {
                                  const isSubModuleExpanded = expandedSubModules.has(subModule.path);
                                  
                                  return (
                                    <div
                                      key={subModule.path}
                                      className="border-b border-gray-100 last:border-b-0"
                                    >
                                      <div
                                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleToggleSubModule(subModule.path)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={isSubModuleExpanded ? toCloseIcon : toOpenIcon}
                                            alt={isSubModuleExpanded ? 'Cerrar' : 'Abrir'}
                                            className="w-4 h-4 transition-transform"
                                          />
                                          <h5 className="font-medium text-gray-900">{subModule.name}</h5>
                                        </div>
                                      </div>
                                      
                                      {/* Detalles del submódulo cuando está expandido */}
                                      {isSubModuleExpanded && subModule.permission && (
                                        <div className="px-4 pb-4 pl-8 bg-gray-50">
                                          <p className="text-xs text-gray-500 mt-1 font-mono">{subModule.permission.code}</p>
                                          {subModule.permission.description && (
                                            <p className="text-sm text-gray-600 mt-2">{subModule.permission.description}</p>
                                          )}
                                          <div className="flex gap-2 mt-2">
                                            {subModule.permission.resource && (
                                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                {subModule.permission.resource}
                                              </span>
                                            )}
                                            {subModule.permission.action && (
                                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                                {subModule.permission.action}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              // Para otras categorías, mostrar en grid normal
              return (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryPermissions.map(permission => (
                      <div
                        key={permission.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {permission.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 font-mono">{permission.code}</p>
                            {permission.description && (
                              <p className="text-sm text-gray-600 mt-2">{permission.description}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {permission.resource && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

