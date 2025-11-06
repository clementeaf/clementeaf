import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarHeader } from './SidebarHeader';
import { NavItem } from './NavItem';
import { SubMenu } from './SubMenu';
import { navItems } from './navItems.config';
import { isActive, isSectionActive } from './utils';
import type { NavItem as NavItemType } from './types';

/**
 * Configuración de subitems por sección
 * Puedes agregar subitems para cada sección que tenga hasSubItems: true
 */
interface SectionSubItems {
  [sectionName: string]: NavItemType[];
}

/**
 * Componente Sidebar de la aplicación cliente
 * @returns Componente Sidebar
 */
export const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [manualToggles, setManualToggles] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Configuración de subitems por sección (puedes personalizar esto)
  // Mover fuera del componente si necesitas que persista entre renders
  const sectionSubItems: SectionSubItems = {};

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.hasSubItems && sectionSubItems[item.name]) {
        const sectionKey = item.name;
        if (!manualToggles[sectionKey]) {
          const active = isSectionActive(location.pathname, item.path, sectionSubItems[item.name]);
          setExpandedSections((prev) => ({
            ...prev,
            [sectionKey]: active
          }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, manualToggles]);

  const handleToggleSection = (sectionName: string): void => {
    setManualToggles((prev) => ({
      ...prev,
      [sectionName]: true
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleSectionNavigation = (sectionName: string): void => {
    setManualToggles((prev) => ({
      ...prev,
      [sectionName]: false
    }));
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

      <nav className={`w-full flex flex-col transition-all duration-300 ${isExpanded ? 'px-2' : 'px-1'}`}>
        {navItems.map((item) => {
          const active = isActive(item.path, location.pathname);
          const hasSubItems = item.hasSubItems === true;
          const sectionKey = item.name;
          const expanded = hasSubItems ? expandedSections[sectionKey] || false : false;
          const subItems = hasSubItems && sectionSubItems[sectionKey] ? sectionSubItems[sectionKey] : [];

          return (
            <div key={item.path} className="w-full">
              <NavItem
                item={item}
                isActive={active && !hasSubItems}
                isExpanded={expanded}
                onToggle={hasSubItems ? () => handleToggleSection(sectionKey) : undefined}
                showExpandIcon={hasSubItems}
                isCollapsed={!isExpanded}
              />

              {hasSubItems && isExpanded && subItems.length > 0 && (
                <SubMenu
                  subItems={subItems}
                  isExpanded={expanded}
                  onNavigate={() => handleSectionNavigation(sectionKey)}
                />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

