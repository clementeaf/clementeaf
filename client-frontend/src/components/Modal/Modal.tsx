import { useEffect, useState, type ReactNode } from 'react';

/**
 * Props del componente Modal
 */
export interface ModalProps {
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  /**
   * Título del modal
   */
  title?: string;
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
  /**
   * Si se puede cerrar haciendo clic fuera del modal
   */
  closeOnOverlayClick?: boolean;
  /**
   * Si se puede cerrar presionando ESC
   */
  closeOnEscape?: boolean;
}

/**
 * Componente Modal reutilizable con animaciones suaves
 * @param props - Props del componente Modal
 * @returns Componente Modal
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  containerClassName = '',
  contentClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true
}: ModalProps): React.ReactElement | null => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
      />
      <div
        className={`relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto transform transition-all duration-300 ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 -translate-y-4'
        } ${containerClassName}`}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className={`${title ? 'p-6' : 'p-6'} ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
};

