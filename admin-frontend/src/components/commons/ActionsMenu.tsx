import { useState, useRef, useEffect } from 'react';
import { MoreOptionsIcon } from './icons';

/**
 * Opción del menú de acciones
 */
export interface ActionMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

/**
 * Props del componente ActionsMenu
 */
export interface ActionsMenuProps {
  /**
   * Items del menú
   */
  items: ActionMenuItem[];
  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}

/**
 * Componente de menú desplegable de acciones
 * @param props - Props del componente ActionsMenu
 * @returns Componente ActionsMenu
 */
export const ActionsMenu = ({ items, className = '' }: ActionsMenuProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Cierra el menú cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Maneja el click en una opción del menú
   */
  const handleItemClick = (item: ActionMenuItem): void => {
    item.onClick();
    setIsOpen(false);
  };

  /**
   * Maneja el toggle del menú
   */
  const handleToggle = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        title="Acciones"
      >
        <MoreOptionsIcon color="currentColor" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2 transition-colors"
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

