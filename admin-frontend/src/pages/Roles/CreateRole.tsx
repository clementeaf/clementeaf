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
  hasServices?: boolean;
  services?: ServiceItem[];
}

/**
 * Interfaz para servicios
 */
interface ServiceItem {
  id: string;
  name: string;
  code: string;
  description: string;
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
  const [selectedServiceCodes, setSelectedServiceCodes] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSubModules, setExpandedSubModules] = useState<Set<string>>(new Set());
  
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
   * Obtiene los servicios disponibles para un submódulo
   */
  const getServicesForSubModule = (subModuleName: string, subModulePath: string): ServiceItem[] => {
    // Servicios para Clientes
    if (subModuleName === 'Clientes' || subModulePath === '/clients') {
      return [
        {
          id: 'service-create-client',
          name: 'Crear Cliente',
          code: 'post:clients',
          description: 'Permite crear nuevos clientes'
        },
        {
          id: 'service-get-client',
          name: 'Obtener Cliente',
          code: 'get:clients:{id}',
          description: 'Permite ver detalles de un cliente específico'
        },
        {
          id: 'service-list-clients',
          name: 'Listar Clientes',
          code: 'get:clients',
          description: 'Permite ver la lista de todos los clientes'
        },
        {
          id: 'service-search-clients',
          name: 'Buscar Clientes',
          code: 'get:clients:search:query',
          description: 'Permite buscar clientes por nombre o RUT'
        },
        {
          id: 'service-update-client',
          name: 'Actualizar Cliente',
          code: 'put:clients:{id}',
          description: 'Permite modificar datos de clientes existentes'
        },
        {
          id: 'service-delete-client',
          name: 'Eliminar Cliente',
          code: 'delete:clients:{id}',
          description: 'Permite eliminar clientes del sistema'
        }
      ];
    }

    // Servicios para Nota de venta
    if (subModuleName === 'Nota de venta' || subModulePath === '/quotes') {
      return [
        {
          id: 'service-create-quote',
          name: 'Crear Nota de Venta',
          code: 'post:quotes',
          description: 'Permite crear nuevas notas de venta'
        },
        {
          id: 'service-get-quote',
          name: 'Obtener Nota de Venta',
          code: 'get:quotes:{id}',
          description: 'Permite ver detalles de una nota de venta específica'
        },
        {
          id: 'service-list-quotes',
          name: 'Listar Notas de Venta',
          code: 'get:quotes',
          description: 'Permite ver la lista de todas las notas de venta'
        },
        {
          id: 'service-update-quote',
          name: 'Actualizar Nota de Venta',
          code: 'put:quotes:{id}',
          description: 'Permite modificar datos de notas de venta existentes'
        },
        {
          id: 'service-delete-quote',
          name: 'Eliminar Nota de Venta',
          code: 'delete:quotes:{id}',
          description: 'Permite eliminar notas de venta del sistema'
        },
        {
          id: 'service-get-next-quote-number',
          name: 'Obtener Siguiente Número',
          code: 'get:quotes:next-number:query',
          description: 'Permite obtener el siguiente número correlativo de cotización'
        }
      ];
    }

    // Servicios para Cuentas por cobrar
    if (subModuleName === 'Cuentas por cobrar' || subModulePath === '/collections') {
      return [
        {
          id: 'service-get-ctas-por-cobrar',
          name: 'Obtener Cuentas por Cobrar',
          code: 'get:analytics:ctas-por-cobrar',
          description: 'Permite ver todas las cuentas por cobrar con filtros'
        },
        {
          id: 'service-get-deudas-activas',
          name: 'Obtener Deudas Activas',
          code: 'get:analytics:deudas-activas',
          description: 'Permite ver deudas activas agrupadas por empresa'
        },
        {
          id: 'service-get-resumen-clientes',
          name: 'Obtener Resumen por Cliente',
          code: 'get:analytics:resumen:clientes',
          description: 'Permite ver resumen de cuentas por cobrar por cliente'
        },
        {
          id: 'service-get-resumen-vendedores',
          name: 'Obtener Resumen por Vendedor',
          code: 'get:analytics:resumen:vendedores',
          description: 'Permite ver resumen de cuentas por cobrar por vendedor'
        },
        {
          id: 'service-get-estadisticas',
          name: 'Obtener Estadísticas',
          code: 'get:analytics:estadisticas',
          description: 'Permite ver estadísticas generales de cuentas por cobrar'
        }
      ];
    }

    // Servicios para Orden de picking
    if (subModuleName === 'Orden de picking' || subModulePath === '/picking/order' || subModulePath.includes('picking/order')) {
      return [
        {
          id: 'service-create-picking-order',
          name: 'Crear Orden de Picking',
          code: 'post:picking:orders',
          description: 'Permite crear nuevas órdenes de picking'
        },
        {
          id: 'service-get-picking-order',
          name: 'Obtener Orden de Picking',
          code: 'get:picking:orders:{id}',
          description: 'Permite ver detalles de una orden de picking específica'
        },
        {
          id: 'service-list-picking-orders',
          name: 'Listar Órdenes de Picking',
          code: 'get:picking:orders',
          description: 'Permite ver la lista de todas las órdenes de picking'
        },
        {
          id: 'service-update-picking-order',
          name: 'Actualizar Orden de Picking',
          code: 'put:picking:orders:{id}',
          description: 'Permite modificar datos y estado de órdenes de picking'
        },
        {
          id: 'service-delete-picking-order',
          name: 'Eliminar Orden de Picking',
          code: 'delete:picking:orders:{id}',
          description: 'Permite eliminar órdenes de picking del sistema'
        },
        {
          id: 'service-update-picking-status',
          name: 'Cambiar Estado de Orden',
          code: 'put:picking:orders:{id}:status',
          description: 'Permite cambiar el estado de una orden de picking'
        }
      ];
    }

    // Servicios para Métricas
    if (subModuleName === 'Métricas' || subModulePath === '/picking/metrics' || subModulePath.includes('picking/metrics')) {
      return [
        {
          id: 'service-get-picking-metrics',
          name: 'Obtener Métricas de Picking',
          code: 'get:picking:metrics',
          description: 'Permite ver métricas generales de picking'
        },
        {
          id: 'service-get-picking-statistics',
          name: 'Obtener Estadísticas',
          code: 'get:picking:metrics:statistics',
          description: 'Permite ver estadísticas detalladas de picking'
        },
        {
          id: 'service-get-picking-history',
          name: 'Obtener Historial de Métricas',
          code: 'get:picking:metrics:history',
          description: 'Permite ver historial y tendencias de métricas'
        },
        {
          id: 'service-get-picking-efficiency',
          name: 'Obtener Eficiencia',
          code: 'get:picking:metrics:efficiency',
          description: 'Permite ver métricas de eficiencia de picking'
        }
      ];
    }

    // Servicios para Roles (submódulo)
    if (subModuleName === 'Roles' || subModulePath === '/roles/roles' || subModulePath.includes('roles/roles')) {
      return [
        {
          id: 'service-create-role',
          name: 'Crear Rol',
          code: 'post:roles',
          description: 'Permite crear nuevos roles en el sistema'
        },
        {
          id: 'service-get-role',
          name: 'Obtener Rol',
          code: 'get:roles:{id}',
          description: 'Permite ver detalles de un rol específico'
        },
        {
          id: 'service-list-roles',
          name: 'Listar Roles',
          code: 'get:roles',
          description: 'Permite ver la lista de todos los roles'
        },
        {
          id: 'service-update-role',
          name: 'Actualizar Rol',
          code: 'put:roles:{id}',
          description: 'Permite modificar datos y permisos de roles existentes'
        },
        {
          id: 'service-delete-role',
          name: 'Eliminar Rol',
          code: 'delete:roles:{id}',
          description: 'Permite eliminar roles del sistema'
        }
      ];
    }

    // Servicios para Usuarios
    if (subModuleName === 'Usuarios' || subModulePath === '/roles/users' || subModulePath.includes('roles/users')) {
      return [
        {
          id: 'service-create-user',
          name: 'Crear Usuario',
          code: 'post:auth:register',
          description: 'Permite crear nuevos usuarios en el sistema'
        },
        {
          id: 'service-get-user',
          name: 'Obtener Usuario',
          code: 'get:users:{id}',
          description: 'Permite ver detalles de un usuario específico'
        },
        {
          id: 'service-list-users',
          name: 'Listar Usuarios',
          code: 'get:users',
          description: 'Permite ver la lista de todos los usuarios'
        },
        {
          id: 'service-update-user-role',
          name: 'Actualizar Rol de Usuario',
          code: 'put:users:{id}:role',
          description: 'Permite asignar o cambiar el rol de un usuario'
        }
      ];
    }
    
    return [];
  };

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
      .map(item => {
        const services = getServicesForSubModule(item.name, item.path);
        return {
          id: `submodule-${item.path}`,
          name: item.name,
          path: item.path,
          code: `view:${item.path.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id')}`,
          hasServices: services.length > 0,
          services: services.length > 0 ? services : undefined
        };
      });
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
      
      // Si hay permisos, mapear los módulos, submódulos y servicios seleccionados
      if (permissionsData.length > 0) {
        const allSelectedCodes = [...selectedModuleCodes, ...selectedSubModuleCodes, ...selectedServiceCodes];
        if (allSelectedCodes.length > 0) {
          const permissionIds = permissionsData
            .filter(p => allSelectedCodes.includes(p.code))
            .map(p => p.id);
          setFormData(prev => ({
            ...prev,
            permissionIds: [...new Set([...prev.permissionIds, ...permissionIds])]
          }));
        }
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
   * Maneja el cambio de checkbox de servicio
   */
  const handleServiceToggle = (serviceCode: string): void => {
    setSelectedServiceCodes(prev => {
      const isSelected = prev.includes(serviceCode);
      const newCodes = isSelected
        ? prev.filter(c => c !== serviceCode)
        : [...prev, serviceCode];
      
      // Si hay permisos cargados, actualizar también los IDs
      if (permissions.length > 0) {
        const servicePermission = permissions.find(p => p.code === serviceCode);
        if (servicePermission) {
          setFormData(prevForm => {
            const isIdSelected = prevForm.permissionIds.includes(servicePermission.id);
            return {
              ...prevForm,
              permissionIds: isIdSelected
                ? prevForm.permissionIds.filter(id => id !== servicePermission.id)
                : [...prevForm.permissionIds, servicePermission.id]
            };
          });
        }
      }
      
      return newCodes;
    });
  };

  /**
   * Maneja el toggle de expansión de submódulo
   */
  const handleToggleSubModuleExpansion = (subModulePath: string): void => {
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
      
      // Si hay módulos, submódulos o servicios seleccionados pero no hay permisos sincronizados, sincronizar primero
      let finalPermissionIds = formData.permissionIds;
      const allSelectedCodes = [...selectedModuleCodes, ...selectedSubModuleCodes, ...selectedServiceCodes];
      
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
                              const hasServices = subModule.hasServices && subModule.services && subModule.services.length > 0;
                              const isSubModuleExpanded = expandedSubModules.has(subModule.path);
                              
                              return (
                                <div key={subModule.id} className="space-y-1">
                                  <div className="flex items-center gap-2">
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
                                      {hasServices && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSubModuleExpansion(subModule.path);
                                          }}
                                          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors ml-auto"
                                        >
                                          <img
                                            src={isSubModuleExpanded ? toCloseIcon : toOpenIcon}
                                            alt={isSubModuleExpanded ? 'Cerrar' : 'Abrir'}
                                            className="w-4 h-4"
                                          />
                                        </button>
                                      )}
                                    </label>
                                  </div>
                                  
                                  {/* Mostrar servicios si el submódulo los tiene y está expandido */}
                                  {hasServices && isSubModuleExpanded && (
                                    <div className="ml-6 space-y-1 border-l-2 border-gray-300 pl-3">
                                      {subModule.services!.map(service => {
                                        const isServiceSelected = selectedServiceCodes.includes(service.code);
                                        
                                        return (
                                          <div key={service.id} className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={isServiceSelected}
                                              onChange={() => handleServiceToggle(service.code)}
                                              className="flex-shrink-0"
                                            />
                                            <label
                                              className="flex-1 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2"
                                              onClick={() => handleServiceToggle(service.code)}
                                            >
                                              <span className="text-sm font-medium text-gray-600">{service.name}</span>
                                              <span className="text-xs text-gray-500">
                                                ({service.description})
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

