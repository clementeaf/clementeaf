import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from './types';
import checkIcon from '../../assets/check.png';

/**
 * Props del componente NavSubItem
 */
interface NavSubItemProps {
  item: NavItem;
  onNavigate?: () => void;
}

/**
 * Componente para subitems de navegación
 * @param props - Props del subitem
 * @returns Componente NavSubItem
 */
export const NavSubItem = ({ item, onNavigate }: NavSubItemProps) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <Link
      to={item.path}
      onClick={handleClick}
      className={`w-full flex items-center px-4 py-3 rounded-[20px] my-1 text-white transition-all duration-300 ease-in-out hover:opacity-90 ${
        isActive ? 'bg-[#004BB7]' : ''
      }`}
    >
      <p className="text-[12px] font-medium tracking-[0%] transition-all duration-200 flex items-center gap-2">
        <img src={checkIcon} alt="check" className="w-4 h-4" />  {item.name}
      </p>
    </Link>
  );
};

