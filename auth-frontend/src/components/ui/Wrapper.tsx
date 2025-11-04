import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Props del componente Wrapper
 */
export interface WrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Componente Wrapper reutilizable y agnóstico
 * Contenedor de estructura que solo renderiza children
 * @param props - Props del div HTML nativo
 * @returns Componente Wrapper
 */
export const Wrapper = ({ children, ...divProps }: WrapperProps) => {
  return (
    <div {...divProps}>
      {children}
    </div>
  );
};

