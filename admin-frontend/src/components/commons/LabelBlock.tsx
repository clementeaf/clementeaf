import { type ReactNode } from 'react';

/**
 * Props del componente LabelBlock
 */
export interface LabelBlockProps {
  /**
   * Texto principal
   */
  primaryLabel: string;
  /**
   * Texto secundario
   */
  secondaryLabel?: string;
  /**
   * Ícono a mostrar a la derecha
   */
  rightIcon?: ReactNode;
  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
}

/**
 * Componente LabelBlock headless que muestra labels primario y secundario
 * Los estilos se inyectan mediante className
 * @param props - Props del componente LabelBlock
 * @returns Componente LabelBlock
 */
export const LabelBlock = ({
  primaryLabel,
  secondaryLabel,
  rightIcon,
  className = ''
}: LabelBlockProps): React.ReactElement => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{primaryLabel}</span>
        {secondaryLabel && (
          <span className="text-xs text-gray-600 mt-0.5">{secondaryLabel}</span>
        )}
      </div>
      {rightIcon && <div className="flex-shrink-0 ml-4">{rightIcon}</div>}
    </div>
  );
};

