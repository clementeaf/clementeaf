import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { routes } from '../routes';
import homeIcon from '../assets/home.png';
import opportunitiesIcon from '../assets/oportunities.png';
import articlesIcon from '../assets/articles.png';
import sellsIcon from '../assets/sells.png';
import checkIcon from '../assets/check.png';
import toOpenIcon from '../assets/toOpen.png';
import toCloseIcon from '../assets/toClose.png';

/**
 * Tipo para items de navegación
 */
interface NavItem {
  name: string;
  path: string;
  icon: string;
  hasSubItems?: boolean;
}

/**
 * Componente Sidebar de la aplicación admin
 * @returns Componente Sidebar
 */
export const Sidebar = () => {
  const location = useLocation();
  const [isSellsExpanded, setIsSellsExpanded] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Inicio', path: routes.home, icon: homeIcon },
    { name: 'Oportunidades', path: routes.opportunities, icon: opportunitiesIcon },
    { name: 'Artículos', path: routes.articles, icon: articlesIcon, hasSubItems: true },
    { name: 'Ventas', path: routes.sells, icon: sellsIcon, hasSubItems: true }
  ];

  const sellsSubItems: NavItem[] = [
    { name: 'Clientes', path: routes.clients, icon: checkIcon },
    { name: 'Cotizaciones', path: routes.quotes, icon: checkIcon },
    { name: 'Orden de ventas', path: routes.salesOrder, icon: checkIcon }
  ];

  useEffect(() => {
    const isSellsActive = sellsSubItems.some(item => location.pathname === item.path) || 
                          location.pathname === routes.sells;
    if (isSellsActive) {
      setIsSellsExpanded(true);
    }
  }, [location.pathname, sellsSubItems]);

  const isActive = (path: string): boolean => {
    if (path === routes.home) {
      return location.pathname === routes.home;
    }
    return location.pathname.startsWith(path);
  };

  const isSellsSectionActive = (): boolean => {
    return sellsSubItems.some(item => location.pathname === item.path) || 
           location.pathname === routes.sells;
  };

  const toggleSells = (): void => {
    setIsSellsExpanded(!isSellsExpanded);
  };

  return (
    <div className="w-[208px] h-full bg-[#002254] text-white flex flex-col items-start py-4">
      <div className="w-full flex items-center justify-center mb-6 px-4">
        <h1 className="text-2xl font-bold text-white">B360</h1>
      </div>

      <nav className="w-full flex flex-col px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const isSellsItem = item.name === 'Ventas';
          const shouldShowExpand = isSellsItem && isSellsSectionActive();
          const expanded = isSellsItem && (isSellsExpanded || shouldShowExpand);

          return (
            <div key={item.path} className="w-full">
              <div
                className={`w-full flex items-center justify-between px-4 py-3 my-1 rounded-[20px] cursor-pointer transition-all duration-300 ease-in-out ${
                  active && !isSellsItem
                    ? 'bg-[#004BB7] shadow-md'
                    : 'hover:bg-blue-800 hover:shadow-sm'
                }`}
                onClick={isSellsItem ? toggleSells : undefined}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-3 flex-1 text-white transition-opacity duration-200 hover:opacity-90"
                  onClick={(e) => {
                    if (isSellsItem) {
                      e.preventDefault();
                    }
                  }}
                >
                  <img src={item.icon} alt={item.name} className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                  <span className="text-[14px] leading-[20px] font-medium tracking-[0%] transition-all duration-200">{item.name}</span>
                </Link>
                {item.hasSubItems && (
                  <span className="text-xs text-white transition-transform duration-300">
                    {isSellsItem && expanded ? (
                      <img src={toCloseIcon} alt="toClose" className="w-4 h-4 transition-transform duration-300 rotate-0" />
                    ) : (
                      <img src={toOpenIcon} alt="toOpen" className="w-4 h-4 transition-transform duration-300 rotate-0" />
                    )}
                  </span>
                )}
              </div>

              {isSellsItem && (
                <div 
                  className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    expanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  <div className="flex flex-col">
                    {sellsSubItems.map((subItem) => {
                      const subActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                            subActive
                              ? 'bg-[#B0C9EE] text-gray-800 shadow-sm'
                              : 'hover:bg-blue-800 text-white hover:shadow-sm'
                          }`}
                        >
                          <img 
                            src={subItem.icon} 
                            alt={subItem.name} 
                            className="w-4 h-4 transition-transform duration-200 hover:scale-110" 
                          />
                          <span className="text-[14px] leading-[20px] font-medium tracking-[0%] transition-all duration-200">
                            {subItem.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

