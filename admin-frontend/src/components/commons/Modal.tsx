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
        {children}
      </div>
    </div>
  );
};

