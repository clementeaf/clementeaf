import { type ReactNode } from 'react';

/**
 * Props del componente ContentArea
 */
interface ContentAreaProps {
  /**
   * Contenido a mostrar en el área
   */
  children: ReactNode;
}

/**
 * Componente para mostrar el área de contenido principal
 * @param props - Props del componente ContentArea
 * @returns Componente ContentArea
 */
export const ContentArea = ({ children }: ContentAreaProps) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto">
      {children}
    </div>
  );
};

