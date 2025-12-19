import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from './types';

/**
 * Props del componente NavSubItem
 */
interface NavSubItemProps {
  item: NavItem;
  subItems?: NavItem[];
  onNavigate?: () => void;
}

/**
 * Verifica si un submódulo está activo de forma precisa
 * Prioriza rutas más específicas sobre rutas generales
 * @param itemPath - Ruta del submódulo
 * @param currentPath - Ruta actual
 * @param allSubItems - Todos los submódulos del mismo módulo padre
 * @returns true si el submódulo está activo
 */
const isSubItemActive = (itemPath: string, currentPath: string, allSubItems: NavItem[] = []): boolean => {
  // Primero, encontrar todos los submódulos que coinciden con la ruta actual
  const matchingSubItems = allSubItems.filter(subItem => {
    // Coincidencia exacta
    if (currentPath === subItem.path) {
      return true;
    }
    // O la ruta actual empieza con la ruta del submódulo seguida de '/'
    if (currentPath.startsWith(`${subItem.path}/`)) {
      return true;
    }
    return false;
  });
  
  // Si no hay coincidencias, este item no está activo
  if (matchingSubItems.length === 0) {
    return false;
  }
  
  // Encontrar el submódulo más específico (ruta más larga)
  const mostSpecificMatch = matchingSubItems.reduce((mostSpecific, current) => {
    return current.path.length > mostSpecific.path.length ? current : mostSpecific;
  }, matchingSubItems[0]);
  
  // Este item está activo solo si es el más específico que coincide
  return mostSpecificMatch.path === itemPath;
};

/**
 * Componente para subitems de navegación
 * @param props - Props del subitem
 * @returns Componente NavSubItem
 */
export const NavSubItem = ({ item, subItems = [], onNavigate }: NavSubItemProps) => {
  const location = useLocation();
  const isActive = isSubItemActive(item.path, location.pathname, subItems);
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
      className={`w-full flex items-center px-4 py-3 rounded-[20px] my-1 text-white transition-all duration-300 ease-in-out hover:opacity-90 min-w-0 ${
        isActive ? 'bg-[#004BB7]' : ''
      }`}
    >
      <p className="text-[12px] font-medium tracking-[0%] transition-all duration-200 min-w-0 truncate">
        {item.name}
      </p>
    </Link>
  );
};
