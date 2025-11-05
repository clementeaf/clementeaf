import { type ReactNode } from 'react';

/**
 * Props del componente FilterChip
 */
export interface FilterChipProps {
  /**
   * Texto del chip
   */
  label: string;
  /**
   * Ícono a mostrar a la derecha
   */
  rightIcon?: ReactNode;
  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Componente FilterChip headless que muestra un chip con texto e ícono
 * Los estilos se inyectan mediante className
 * @param props - Props del componente FilterChip
 * @returns Componente FilterChip
 */
export const FilterChip = ({
  label,
  rightIcon,
  className = '',
  onClick
}: FilterChipProps): React.ReactElement => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${className}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {rightIcon && <div className="flex-shrink-0">{rightIcon}</div>}
    </div>
  );
};

