import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Props del componente Button
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

/**
 * Componente Button reutilizable y agnóstico
 * Permite personalizar estilos mediante className o usa estilos por defecto
 * @param props - Props del button HTML nativo más props adicionales
 * @returns Componente Button
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  disabled,
  className,
  ...buttonProps 
}: ButtonProps) => {
  const defaultClass = 'border-2 border-blue-500 rounded-xl px-4 py-2 text-md text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300 w-full mt-4';

  return (
    <button 
      {...buttonProps} 
      disabled={disabled || isLoading}
      data-variant={variant}
      data-loading={isLoading}
      className={className || defaultClass}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

