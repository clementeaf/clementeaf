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
      className='border-2 border-blue-500 rounded-xl px-4 py-2 text-md text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300 w-full mt-4'
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

