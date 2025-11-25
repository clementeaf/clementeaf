import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarHeader } from './Sidebar/SidebarHeader';
import { NavItem } from './Sidebar/NavItem';
import { SellsSubMenu } from './Sidebar/SellsSubMenu';
import { navItems, sellsSubItems } from './Sidebar/navItems.config';
import { isActive, isSellsSectionActive } from './Sidebar/utils';
import { useLogout } from '../hooks/useAuth';

/**
 * Componente Sidebar de la aplicación admin
 * @returns Componente Sidebar
 */
export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useLogout();
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

      <nav className={`w-full flex flex-col transition-all duration-300 flex-1 ${isExpanded ? 'px-2' : 'px-1'}`}>
        {navItems.map((item) => {
          const active = isActive(item.path, location.pathname);
          const isSellsItem = item.name === 'Ventas';
          const expanded = isSellsItem ? isSellsExpanded : false;
          const sellsSectionActive = isSellsItem && isSellsSectionActive(location.pathname, sellsSubItems);

          return (
            <div key={item.path} className="w-full">
              <NavItem
                item={item}
                isActive={isSellsItem ? sellsSectionActive : active}
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

