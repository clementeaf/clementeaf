import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Input } from '../../components/commons';
import { rolesService, permissionsService, type Permission, type CreateRoleDto } from '../../services/rolesService';
import { routes } from '../../routes';
import { toast } from 'react-toastify';
import ArrowRightIcon from '../../assets/right.png';
import { navItems, sellsSubItems, pickingSubItems, rolesSubItems } from '../../components/Sidebar/navItems.config';
import toOpenIcon from '../../assets/toOpen.png';
import toCloseIcon from '../../assets/toClose.png';

/**
 * Interfaz para módulos del sidebar
 */
interface ModuleItem {
  id: string;
  name: string;
  path: string;
  code: string;
  hasSubItems?: boolean;
  subItems?: SubModuleItem[];
}

/**
 * Interfaz para submódulos
 */
interface SubModuleItem {
  id: string;
  name: string;
  path: string;
  code: string;
}

/**
 * Página de creación de rol
 * @returns Componente CreateRole
 */
export const CreateRole = (): React.ReactElement => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModuleCodes, setSelectedModuleCodes] = useState<string[]>([]);
  const [selectedSubModuleCodes, setSelectedSubModuleCodes] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
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
   * Mapea los submódulos a sus módulos padres
   */
  const getSubItemsForModule = (moduleName: string): SubModuleItem[] => {
    let subItems: typeof sellsSubItems = [];
    
    if (moduleName === 'Ventas') {
      subItems = sellsSubItems;
    } else if (moduleName === 'Picking') {
      subItems = pickingSubItems;
    } else if (moduleName === 'Roles') {
      subItems = rolesSubItems;
    }
    
    return subItems
      .filter(item => !item.path.includes('*')) // Excluir rutas wildcard
      .map(item => ({
        id: `submodule-${item.path}`,
        name: item.name,
        path: item.path,
        code: `view:${item.path.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id')}`
      }));
  };

  /**
   * Genera los módulos directamente desde navItems con sus submódulos
   */
  const modules: ModuleItem[] = navItems
    .filter(item => !item.path.includes('*')) // Excluir rutas wildcard
    .map(item => {
      const module: ModuleItem = {
        id: `module-${item.path}`,
        name: item.name,
        path: item.path,
        code: `module:${item.path.replace(/^\//, '').replace(/\//g, ':')}`,
        hasSubItems: item.hasSubItems || false
      };
      
      // Agregar submódulos si el módulo los tiene
      if (module.hasSubItems) {
        module.subItems = getSubItemsForModule(item.name);
      }
      
      return module;
    });

  /**
   * Carga permisos del backend en background
   */
  useEffect(() => {
    loadPermissions();
  }, []);

  /**
   * Carga permisos del backend (opcional, para sincronizar después)
   */
  const loadPermissions = async (): Promise<void> => {
    try {
      const permissionsData = await permissionsService.getAllPermissions();
      setPermissions(permissionsData);
      
      // Si hay permisos, mapear los módulos seleccionados
      if (permissionsData.length > 0 && selectedModuleCodes.length > 0) {
        const modulePermissionIds = permissionsData
          .filter(p => selectedModuleCodes.includes(p.code))
          .map(p => p.id);
        setFormData(prev => ({
          ...prev,
          permissionIds: [...prev.permissionIds.filter(id => !modulePermissionIds.includes(id)), ...modulePermissionIds]
        }));
      }
    } catch (error) {
      // Silenciar errores, los módulos se muestran de todas formas
      console.error('Error loading permissions (non-blocking):', error);
    }
  };

  /**
   * Maneja el cambio de checkbox de módulo
   */
  const handleModuleToggle = (moduleCode: string): void => {
    setSelectedModuleCodes(prev => {
      const isSelected = prev.includes(moduleCode);
      const newCodes = isSelected
        ? prev.filter(c => c !== moduleCode)
        : [...prev, moduleCode];
      
      // Si hay permisos cargados, actualizar también los IDs
      if (permissions.length > 0) {
        const modulePermission = permissions.find(p => p.code === moduleCode);
        if (modulePermission) {
          setFormData(prevForm => {
            const isIdSelected = prevForm.permissionIds.includes(modulePermission.id);
            return {
              ...prevForm,
              permissionIds: isIdSelected
                ? prevForm.permissionIds.filter(id => id !== modulePermission.id)
                : [...prevForm.permissionIds, modulePermission.id]
            };
          });
        }
      }
      
      return newCodes;
    });
  };

  /**
   * Maneja el cambio de checkbox de submódulo
   */
  const handleSubModuleToggle = (subModuleCode: string): void => {
    setSelectedSubModuleCodes(prev => {
      const isSelected = prev.includes(subModuleCode);
      const newCodes = isSelected
        ? prev.filter(c => c !== subModuleCode)
        : [...prev, subModuleCode];
      
      // Si hay permisos cargados, actualizar también los IDs
      if (permissions.length > 0) {
        const subModulePermission = permissions.find(p => p.code === subModuleCode);
        if (subModulePermission) {
          setFormData(prevForm => {
            const isIdSelected = prevForm.permissionIds.includes(subModulePermission.id);
            return {
              ...prevForm,
              permissionIds: isIdSelected
                ? prevForm.permissionIds.filter(id => id !== subModulePermission.id)
                : [...prevForm.permissionIds, subModulePermission.id]
            };
          });
        }
      }
      
      return newCodes;
    });
  };

  /**
   * Maneja el toggle de expansión de módulo
   */
  const handleToggleModuleExpansion = (modulePath: string): void => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modulePath)) {
        newSet.delete(modulePath);
      } else {
        newSet.add(modulePath);
      }
      return newSet;
    });
  };

  /**
   * Maneja la navegación de vuelta
   */
  const handleBack = (): void => {
    navigate(routes.rolesManagement);
  };

  /**
   * Guarda el rol
   */
  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre del rol es requerido');
        return;
      }

      setIsSaving(true);
      
      // Si hay módulos o submódulos seleccionados pero no hay permisos sincronizados, sincronizar primero
      let finalPermissionIds = formData.permissionIds;
      const allSelectedCodes = [...selectedModuleCodes, ...selectedSubModuleCodes];
      
      if (allSelectedCodes.length > 0 && permissions.length === 0) {
        // Sincronizar permisos primero
        const syncedPermissions = await permissionsService.syncPermissions();
        setPermissions(syncedPermissions);
        
        // Mapear códigos a IDs de permisos
        const permissionIds = syncedPermissions
          .filter(p => allSelectedCodes.includes(p.code))
          .map(p => p.id);
        
        finalPermissionIds = permissionIds;
      } else if (allSelectedCodes.length > 0 && permissions.length > 0) {
        // Ya hay permisos, mapear códigos a IDs
        const permissionIds = permissions
          .filter(p => allSelectedCodes.includes(p.code))
          .map(p => p.id);
        
        // Combinar con otros permisos seleccionados
        finalPermissionIds = [...new Set([...formData.permissionIds, ...permissionIds])];
      }
      
      const createDto: CreateRoleDto = {
        name: formData.name,
        description: formData.description || undefined,
        permissionIds: finalPermissionIds
      };
      
      await rolesService.createRole(createDto);
      toast.success('Rol creado exitosamente');
      navigate(routes.rolesManagement);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear rol';
      toast.error(errorMessage);
      console.error('Error creating role:', error);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="w-full h-full p-8 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Crear Rol</h1>
            <nav className="text-sm text-gray-600 flex items-center gap-2">
              <button onClick={handleBack} className="hover:text-black">Roles</button>
              <img src={ArrowRightIcon} alt="Arrow right" className="w-4 h-4" />
              <span className="text-gray-800 font-medium">Crear Rol</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-4xl flex-1 flex flex-col overflow-hidden">
        <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Rol *
            </label>
            <Input
              id="role-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Administrador, Vendedor, etc."
              className="w-full"
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

          <div className="flex-1 flex flex-col overflow-hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex-shrink-0">
              Permisos
            </label>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-blue-700">
                  Módulos
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Módulos principales del sistema)
                  </span>
                </h4>
                <div className="space-y-2 pl-4">
                  {modules.map(module => {
                    const isModuleSelected = selectedModuleCodes.includes(module.code);
                    const hasSubItems = module.hasSubItems && module.subItems && module.subItems.length > 0;
                    const isExpanded = expandedModules.has(module.path);
                    
                    return (
                      <div key={module.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isModuleSelected}
                            onChange={() => handleModuleToggle(module.code)}
                            className="flex-shrink-0"
                          />
                          <label
                            className="flex-1 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2"
                            onClick={() => handleModuleToggle(module.code)}
                          >
                            <span className="text-sm font-medium">{module.name}</span>
                            <span className="text-xs text-gray-500">
                              (Acceso al módulo {module.name})
                            </span>
                            {hasSubItems && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleModuleExpansion(module.path);
                                }}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors ml-auto"
                              >
                                <img
                                  src={isExpanded ? toCloseIcon : toOpenIcon}
                                  alt={isExpanded ? 'Cerrar' : 'Abrir'}
                                  className="w-4 h-4"
                                />
                              </button>
                            )}
                          </label>
                        </div>
                        
                        {/* Mostrar submódulos si el módulo los tiene y está expandido */}
                        {hasSubItems && isExpanded && (
                          <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                            {module.subItems!.map(subModule => {
                              const isSubModuleSelected = selectedSubModuleCodes.includes(subModule.code);
                              
                              return (
                                <div key={subModule.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSubModuleSelected}
                                    onChange={() => handleSubModuleToggle(subModule.code)}
                                    className="flex-shrink-0"
                                  />
                                  <label
                                    className="flex-1 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2"
                                    onClick={() => handleSubModuleToggle(subModule.code)}
                                  >
                                    <span className="text-sm font-medium text-gray-700">{subModule.name}</span>
                                    <span className="text-xs text-gray-500">
                                      (Acceso a {subModule.name})
                                    </span>
                                  </label>
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
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar Rol'}
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

