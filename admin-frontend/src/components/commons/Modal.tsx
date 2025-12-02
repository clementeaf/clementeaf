import { type ReactNode } from 'react';

/**
 * Props del componente Modal
 */
export interface ModalProps {
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  /**
   * Contenido del modal
   */
  children: ReactNode;
  /**
   * Título del modal
   */
  title?: string;
  /**
   * Clases CSS adicionales para el contenedor del modal
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para el contenido del modal
   */
  contentClassName?: string;
}

/**
 * Componente Modal reutilizable
 * @param props - Props del componente Modal
 * @returns Componente Modal
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  containerClassName = '',
  contentClassName = ''
}: ModalProps): React.ReactElement | null => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${containerClassName}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-transform duration-300 ${contentClassName}`}
        onClick={(e): void => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={title ? 'p-6' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
};

