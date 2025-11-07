import { Link } from 'react-router-dom';
import toOpenIcon from '../../assets/toOpen.png';
import toCloseIcon from '../../assets/toClose.png';
import type { NavItem as NavItemType } from './types';

/**
 * Props del componente NavItem
 */
interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
  isExpanded: boolean;
  onToggle?: () => void;
  showExpandIcon?: boolean;
  isCollapsed?: boolean;
}

/**
 * Componente para items de navegación
 * @param props - Props del item
 * @returns Componente NavItem
 */
export const NavItem = ({ 
  item, 
  isActive: active, 
  isExpanded, 
  onToggle,
  showExpandIcon = false,
  isCollapsed = false
}: NavItemProps) => {
  const hasSubItems = item.hasSubItems === true;
  const shouldPreventNavigation = hasSubItems && onToggle;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if (shouldPreventNavigation) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.stopPropagation();
    }
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (onToggle && shouldPreventNavigation) {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }
  };

  const iconElement = (
    <img src={item.icon} alt={item.name} className="w-5 h-5 transition-transform duration-200 hover:scale-110 flex-shrink-0" />
  );

  const textElement = (
    <span className={`text-[14px] leading-[20px] font-medium tracking-[0%] transition-all duration-300 ease-in-out whitespace-nowrap ${
      isCollapsed 
        ? 'opacity-0 max-w-0 overflow-hidden ml-0' 
        : 'opacity-100 max-w-[200px] ml-3'
    }`}>
      {item.name}
    </span>
  );

  return (
    <div
      className={`group relative w-full flex items-center py-3 my-1 rounded-[20px] cursor-pointer transition-all duration-300 ease-in-out ${
        isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
      } ${
        active
          ? 'bg-[#004BB7] shadow-md'
          : 'hover:bg-blue-800 hover:shadow-sm'
      }`}
      onClick={shouldPreventNavigation ? handleDivClick : undefined}
    >
      {shouldPreventNavigation ? (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'flex-1 justify-start'} text-white transition-opacity duration-200 hover:opacity-90`}>
          {iconElement}
          {textElement}
        </div>
      ) : (
        <Link
          to={item.path}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'flex-1 justify-start'} text-white transition-opacity duration-200 hover:opacity-90`}
          onClick={handleLinkClick}
        >
          {iconElement}
          {textElement}
        </Link>
      )}
      {item.hasSubItems && showExpandIcon && !isCollapsed && (
        <span className="text-xs text-white transition-transform duration-300">
          {isExpanded ? (
            <img src={toCloseIcon} alt="toClose" className="w-4 h-4 transition-transform duration-300 rotate-0" />
          ) : (
            <img src={toOpenIcon} alt="toOpen" className="w-4 h-4 transition-transform duration-300 rotate-0" />
          )}
        </span>
      )}
    </div>
  );
};

