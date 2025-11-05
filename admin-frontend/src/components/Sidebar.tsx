import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarHeader } from './Sidebar/SidebarHeader';
import { NavItem } from './Sidebar/NavItem';
import { SellsSubMenu } from './Sidebar/SellsSubMenu';
import { navItems, sellsSubItems } from './Sidebar/navItems.config';
import { isActive, isSellsSectionActive } from './Sidebar/utils';

/**
 * Componente Sidebar de la aplicación admin
 * @returns Componente Sidebar
 */
export const Sidebar = () => {
  const location = useLocation();
  const [isSellsExpanded, setIsSellsExpanded] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!manualToggle) {
      const active = isSellsSectionActive(location.pathname, sellsSubItems);
      setIsSellsExpanded(active);
    }
  }, [location.pathname, manualToggle]);

  const handleToggleSells = (): void => {
    setManualToggle(true);
    setIsSellsExpanded((prev) => !prev);
  };

  const handleSellsNavigation = (): void => {
    setManualToggle(false);
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
          const isSellsItem = item.name === 'Ventas';
          const expanded = isSellsItem ? isSellsExpanded : false;

          return (
            <div key={item.path} className="w-full">
              <NavItem
                item={item}
                isActive={active && !isSellsItem}
                isExpanded={expanded}
                onToggle={isSellsItem ? handleToggleSells : undefined}
                showExpandIcon={item.hasSubItems === true}
                isCollapsed={!isExpanded}
              />

              {isSellsItem && isExpanded && (
                <SellsSubMenu
                  subItems={sellsSubItems}
                  isExpanded={expanded}
                  onNavigate={handleSellsNavigation}
                />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

