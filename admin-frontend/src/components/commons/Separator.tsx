/**
 * Props del componente Separator
 */
export interface SeparatorProps {
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Separator headless que muestra una línea separadora
 * Los estilos se inyectan mediante className
 * @param props - Props del componente Separator
 * @returns Componente Separator
 */
export const Separator = ({ className = '' }: SeparatorProps): React.ReactElement => {
  return <hr className={`border-t border-gray-200 ${className}`} />;
};

