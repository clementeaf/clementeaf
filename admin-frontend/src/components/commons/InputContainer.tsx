import { type ReactNode } from 'react';

/**
 * Props del componente InputContainer
 */
export interface InputContainerProps {
  /**
   * Label del input
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
 * Componente InputContainer headless que muestra un contenedor tipo input
 * Los estilos se inyectan mediante className
 * @param props - Props del componente InputContainer
 * @returns Componente InputContainer
 */
export const InputContainer = ({
  label,
  rightIcon,
  className = '',
  onClick
}: InputContainerProps): React.ReactElement => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer ${className}`}
      onClick={onClick}
    >
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {rightIcon && <div className="flex-shrink-0 ml-4">{rightIcon}</div>}
    </div>
  );
};

