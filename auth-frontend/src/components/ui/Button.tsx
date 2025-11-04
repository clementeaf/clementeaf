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
 * @param props - Props del button HTML nativo más props adicionales
 * @returns Componente Button
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  disabled,
  ...buttonProps 
}: ButtonProps) => {
  return (
    <button 
      {...buttonProps} 
      disabled={disabled || isLoading}
      data-variant={variant}
      data-loading={isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

