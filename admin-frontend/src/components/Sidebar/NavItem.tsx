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
  showExpandIcon = false 
}: NavItemProps) => {
  const hasSubItems = item.hasSubItems === true;
  const shouldPreventNavigation = hasSubItems && onToggle;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if (shouldPreventNavigation) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (onToggle) {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }
  };

  return (
    <div
      className={`w-full flex items-center justify-between px-4 py-3 my-1 rounded-[20px] cursor-pointer transition-all duration-300 ease-in-out ${
        active
          ? 'bg-[#004BB7] shadow-md'
          : 'hover:bg-blue-800 hover:shadow-sm'
      }`}
      onClick={handleDivClick}
    >
      {shouldPreventNavigation ? (
        <div className="flex items-center gap-3 flex-1 text-white transition-opacity duration-200 hover:opacity-90">
          <img src={item.icon} alt={item.name} className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
          <span className="text-[14px] leading-[20px] font-medium tracking-[0%] transition-all duration-200">
            {item.name}
          </span>
        </div>
      ) : (
        <Link
          to={item.path}
          className="flex items-center gap-3 flex-1 text-white transition-opacity duration-200 hover:opacity-90"
          onClick={handleLinkClick}
        >
          <img src={item.icon} alt={item.name} className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
          <span className="text-[14px] leading-[20px] font-medium tracking-[0%] transition-all duration-200">
            {item.name}
          </span>
        </Link>
      )}
      {item.hasSubItems && showExpandIcon && (
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

