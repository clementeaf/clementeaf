import { Button } from './Button';
import { BellIcon, ProfileIcon, PlusIcon } from './icons';

/**
 * Configuración de un botón de acción
 */
export interface ActionButton {
  /**
   * Texto del botón
   */
  label: string;
  /**
   * Función a ejecutar al hacer click
   */
  onClick: () => void;
  /**
   * Estilo del botón: 'primary' (azul) o 'secondary' (azul claro)
   */
  variant?: 'primary' | 'secondary';
  /**
   * Icono personalizado (opcional)
   */
  icon?: string;
}

/**
 * Props del componente PageHeader
 */
export interface PageHeaderProps {
  /**
   * Título de la página
   */
  title: string;
  /**
   * Botones de acción a mostrar
   */
  actionButtons?: ActionButton[];
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Header genérico para páginas
 * @param props - Props del componente PageHeader
 * @returns Componente PageHeader
 */
export const PageHeader = ({ title, actionButtons = [], className = '' }: PageHeaderProps) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        {actionButtons.map((button, index) => {
          const isPrimary = button.variant === 'primary' || (button.variant === undefined && index === actionButtons.length - 1);
          const isSecondary = button.variant === 'secondary' || (!isPrimary && index < actionButtons.length - 1);
          
          return (
            <Button
              key={index}
              onClick={button.onClick}
              leftIcon={
                button.icon ? (
                  <img src={button.icon} alt={`${button.label} icon`} />
                ) : (
                  <PlusIcon color={isSecondary ? '#0052C9' : 'white'} />
                )
              }
              className={
                isSecondary
                  ? 'bg-[#E6EEFA] text-[#0052C9]'
                  : 'bg-[#0052C9] text-white hover:bg-[#004BB7]'
              }
            >
              {button.label}
            </Button>
          );
        })}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <BellIcon color="#6B7280" />
        </button>
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <ProfileIcon color="#9CA3AF" />
          </div>
          <span className="absolute bottom-[5px] right-[5px] w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
};

