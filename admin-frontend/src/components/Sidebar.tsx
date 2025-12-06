import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarHeader } from './Sidebar/SidebarHeader';
import { NavItem } from './Sidebar/NavItem';
import { SellsSubMenu } from './Sidebar/SellsSubMenu';
import { navItems, sellsSubItems, pickingSubItems, rolesSubItems } from './Sidebar/navItems.config';
import { isActive, isSellsSectionActive, isPickingSectionActive, isRolesSectionActive } from './Sidebar/utils';
import { useLogout } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import type { NavItem as NavItemType } from './Sidebar/types';

/**
 * Componente Sidebar de la aplicación admin
 * @returns Componente Sidebar
 */
/**
 * Genera el código de permiso para un módulo
 */
const getModulePermissionCode = (path: string): string => {
  return `module:${path.replace(/^\//, '').replace(/\//g, ':')}`;
};

/**
 * Genera el código de permiso para un submódulo
 */
const getSubModulePermissionCode = (path: string): string => {
  return `view:${path.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id')}`;
};

/**
 * Componente Sidebar de la aplicación admin
 * @returns Componente Sidebar
 */
export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useLogout();
  const { hasPermission, hasModuleAccess, isSuperAdmin, isLoading, user } = usePermissions();
  const [isSellsExpanded, setIsSellsExpanded] = useState(false);
  const [isPickingExpanded, setIsPickingExpanded] = useState(false);
  const [isRolesExpanded, setIsRolesExpanded] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);
  const [manualPickingToggle, setManualPickingToggle] = useState(false);
  const [manualRolesToggle, setManualRolesToggle] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Filtra los módulos según los permisos del usuario
   * Si aún está cargando y hay usuario optimista, mostrar todos los módulos básicos
   * Los permisos se validarán cuando carguen del servidor
   */
  const filteredNavItems = useMemo(() => {
    // Si está cargando pero hay usuario, mostrar módulos básicos (se filtrarán cuando carguen permisos)
    const shouldShowAllBasic = isLoading && user;

    const filtered = navItems.filter(item => {
      // Inicio y Chat siempre visibles (sin restricción de permisos)
      if (item.name === 'Inicio' || item.name === 'Chat' || item.name === 'Soporte') {
        return true;
      }

      // Si aún está cargando permisos, mostrar módulos básicos temporalmente
      if (shouldShowAllBasic) {
        // Mostrar módulos principales mientras cargan permisos
        return item.name === 'Ventas' || item.name === 'Picking' || item.name === 'Roles' || item.name === 'Productos';
      }

      // Validación específica para módulo Productos
      if (item.name === 'Productos') {
        return hasPermission('view:products:search');
      }

      // Para módulos con submódulos, verificar acceso al módulo
      if (item.hasSubItems) {
        let subModuleCodes: string[] = [];
        
        if (item.name === 'Ventas') {
          subModuleCodes = sellsSubItems.map(sub => getSubModulePermissionCode(sub.path));
        } else if (item.name === 'Picking') {
          subModuleCodes = pickingSubItems.map(sub => getSubModulePermissionCode(sub.path));
        } else if (item.name === 'Roles') {
          subModuleCodes = rolesSubItems.map(sub => getSubModulePermissionCode(sub.path));
        }

        const moduleCode = getModulePermissionCode(item.path);
        return hasModuleAccess(moduleCode, subModuleCodes);
      }

      // Para módulos sin submódulos, verificar permiso directo
      const moduleCode = getModulePermissionCode(item.path);
      return hasPermission(moduleCode);
    });

    // Log de módulos filtrados
    if (isSuperAdmin) {
      console.log('👑 [SIDEBAR] Super Admin - Todos los módulos visibles:', {
        totalModules: navItems.length,
        visibleModules: filtered.length,
        moduleNames: filtered.map(m => m.name)
      });
    } else if (filtered.length !== navItems.length) {
      console.log('🔒 [SIDEBAR] Módulos filtrados según permisos:', {
        totalModules: navItems.length,
        visibleModules: filtered.length,
        hiddenModules: navItems.length - filtered.length,
        visibleModuleNames: filtered.map(m => m.name),
        hiddenModuleNames: navItems.filter(m => !filtered.includes(m)).map(m => m.name)
      });
    }

    return filtered;
  }, [hasPermission, hasModuleAccess, isLoading, user]);

  /**
   * Filtra los submódulos según los permisos del usuario
   */
  const getFilteredSubItems = (subItems: NavItemType[]): NavItemType[] => {
    return subItems.filter(subItem => {
      const subModuleCode = getSubModulePermissionCode(subItem.path);
      return hasPermission(subModuleCode);
    });
  };

  useEffect(() => {
    if (!manualToggle) {
      const active = isSellsSectionActive(location.pathname, sellsSubItems);
      setIsSellsExpanded(active);
    }
  }, [location.pathname, manualToggle]);

  useEffect(() => {
    if (!manualPickingToggle) {
      const active = isPickingSectionActive(location.pathname, pickingSubItems);
      setIsPickingExpanded(active);
    }
  }, [location.pathname, manualPickingToggle]);

  useEffect(() => {
    if (!manualRolesToggle) {
      const active = isRolesSectionActive(location.pathname, rolesSubItems);
      setIsRolesExpanded(active);
    }
  }, [location.pathname, manualRolesToggle]);

  const handleToggleSells = (): void => {
    setManualToggle(true);
    setIsSellsExpanded((prev) => !prev);
  };

  const handleSellsNavigation = (): void => {
    setManualToggle(false);
  };

  const handleTogglePicking = (): void => {
    setManualPickingToggle(true);
    setIsPickingExpanded((prev) => !prev);
  };

  const handlePickingNavigation = (): void => {
    setManualPickingToggle(false);
  };

  const handleToggleRoles = (): void => {
    setManualRolesToggle(true);
    setIsRolesExpanded((prev) => !prev);
  };

  const handleRolesNavigation = (): void => {
    setManualRolesToggle(false);
  };

  const handleToggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  const handleMouseEnter = (): void => {
    if (isCollapsed) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setIsHovered(true);
    }
  };

  const handleMouseLeave = (): void => {
    if (isCollapsed) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        hoverTimeoutRef.current = null;
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isExpanded = !isCollapsed || isHovered;

  return (
    <div 
      className={`h-full bg-[#002254] text-white flex flex-col items-start py-4 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-[208px]' : 'w-[64px]'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} isExpanded={isExpanded} />

      <nav className={`w-full flex flex-col transition-all duration-300 flex-1 ${isExpanded ? 'px-2' : 'px-1'}`}>
        {filteredNavItems.map((item) => {
          const active = isActive(item.path, location.pathname);
          const isSellsItem = item.name === 'Ventas';
          const isPickingItem = item.name === 'Picking';
          const isRolesItem = item.name === 'Roles';
          const expanded = isSellsItem ? isSellsExpanded : isPickingItem ? isPickingExpanded : isRolesItem ? isRolesExpanded : false;
          
          // Obtener submódulos filtrados según permisos
          const filteredSellsSubItems = isSellsItem ? getFilteredSubItems(sellsSubItems) : [];
          const filteredPickingSubItems = isPickingItem ? getFilteredSubItems(pickingSubItems) : [];
          const filteredRolesSubItems = isRolesItem ? getFilteredSubItems(rolesSubItems) : [];
          
          const sellsSectionActive = isSellsItem && isSellsSectionActive(location.pathname, filteredSellsSubItems);
          const pickingSectionActive = isPickingItem && isPickingSectionActive(location.pathname, filteredPickingSubItems);
          const rolesSectionActive = isRolesItem && isRolesSectionActive(location.pathname, filteredRolesSubItems);

          // No mostrar el módulo si no tiene submódulos visibles (y tiene submódulos)
          if (item.hasSubItems) {
            if (isSellsItem && filteredSellsSubItems.length === 0) return null;
            if (isPickingItem && filteredPickingSubItems.length === 0) return null;
            if (isRolesItem && filteredRolesSubItems.length === 0) return null;
          }

          return (
            <div key={item.path} className="w-full">
              <NavItem
                item={item}
                isActive={isSellsItem ? sellsSectionActive : isPickingItem ? pickingSectionActive : isRolesItem ? rolesSectionActive : active}
                isExpanded={expanded}
                onToggle={isSellsItem ? handleToggleSells : isPickingItem ? handleTogglePicking : isRolesItem ? handleToggleRoles : undefined}
                showExpandIcon={item.hasSubItems === true}
                isCollapsed={!isExpanded}
              />

              {isSellsItem && isExpanded && filteredSellsSubItems.length > 0 && (
                <SellsSubMenu
                  subItems={filteredSellsSubItems}
                  isExpanded={expanded}
                  onNavigate={handleSellsNavigation}
                />
              )}

              {isPickingItem && isExpanded && filteredPickingSubItems.length > 0 && (
                <SellsSubMenu
                  subItems={filteredPickingSubItems}
                  isExpanded={expanded}
                  onNavigate={handlePickingNavigation}
                />
              )}

              {isRolesItem && isExpanded && filteredRolesSubItems.length > 0 && (
                <SellsSubMenu
                  subItems={filteredRolesSubItems}
                  isExpanded={expanded}
                  onNavigate={handleRolesNavigation}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer con botón de cerrar sesión */}
      <div className={`w-full mt-auto ${isExpanded ? 'px-2' : 'px-1'}`}>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-colors duration-200 ${
            !isExpanded ? 'justify-center' : ''
          }`}
          title={!isExpanded ? 'Cerrar sesión' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isExpanded && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

