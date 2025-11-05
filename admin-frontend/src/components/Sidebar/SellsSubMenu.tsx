import { NavSubItem } from './NavSubItem';
import type { NavItem } from './types';

/**
 * Props del componente SellsSubMenu
 */
interface SellsSubMenuProps {
  subItems: NavItem[];
  isExpanded: boolean;
  onNavigate?: () => void;
}

/**
 * Componente para el submenu de Ventas
 * @param props - Props del submenu
 * @returns Componente SellsSubMenu
 */
export const SellsSubMenu = ({ subItems, isExpanded, onNavigate }: SellsSubMenuProps) => {
  return (
    <div 
      className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
      }`}
    >
      <div className="flex flex-col">
        {subItems.map((subItem) => {
          return (
            <NavSubItem 
              key={subItem.path} 
              item={subItem} 
              onNavigate={onNavigate}
            />
          );
        })}
      </div>
    </div>
  );
};

