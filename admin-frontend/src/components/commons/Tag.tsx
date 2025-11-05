import { type ReactNode } from 'react';

/**
 * Props del componente Tag
 */
export interface TagProps {
  /**
   * Contenido del tag
   */
  children: ReactNode;
  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
}

/**
 * Componente Tag headless que muestra un tag/badge
 * Los estilos se inyectan mediante className
 * @param props - Props del componente Tag
 * @returns Componente Tag
 */
export const Tag = ({ children, className = '' }: TagProps): React.ReactElement => {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${className}`}>
      {children}
    </span>
  );
};

