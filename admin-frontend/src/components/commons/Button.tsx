import { type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * Props del componente Button
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Contenido del botón
   */
  children: ReactNode;
  /**
   * Ícono a mostrar a la izquierda del contenido
   */
  leftIcon?: ReactNode;
  /**
   * Ícono a mostrar a la derecha del contenido
   */
  rightIcon?: ReactNode;
  /**
   * Clases CSS adicionales para el contenedor del botón
   */
  className?: string;
}

/**
 * Componente Button headless que maneja la estructura y lógica del botón
 * Los estilos se inyectan mediante className
 * @param props - Props del componente Button
 * @returns Componente Button
 */
export const Button = ({
  children,
  leftIcon,
  rightIcon,
  className = '',
  ...htmlButtonProps
}: ButtonProps): React.ReactElement => {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${className}`}
      {...htmlButtonProps}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="flex-1 text-sm font-medium">{children}</span>
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

