import { useState } from 'react';
import { Modal, Input, Button } from '../../../components/commons';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../routes';

/**
 * Props del componente VerifyRutModal
 */
interface VerifyRutModalProps {
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
}

/**
 * Componente Modal para verificar RUT
 * @param props - Props del componente VerifyRutModal
 * @returns Componente VerifyRutModal
 */
export const VerifyRutModal = ({ isOpen, onClose }: VerifyRutModalProps): React.ReactElement => {
  const [rut, setRut] = useState('76.543.210-9');
  const navigate = useNavigate();

  const handleVerifyRut = (): void => {
    onClose();
    navigate(routes.createClient);
  };

  const handleClose = (): void => {
    setRut('76.543.210-9');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Empecemos con el RUT</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Ingresa el RUT de la empresa para verificar sus datos en el SII.
          </p>
          <p className="text-sm text-gray-600">
            Si la información es válida, podrás continuar con el registro del cliente.
          </p>
        </div>

        <div className="mb-4">
          <Input
            label="RUT"
            value={rut}
            onChange={(e): void => setRut(e.target.value)}
            placeholder="76.543.210-9"
            containerClassName="mb-2"
          />
        </div>

        <div className="flex items-start gap-2 mb-6">
          <svg
            className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-gray-500">
            Solo los datos disponibles en el SII se completarán automáticamente.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleVerifyRut}
            className="bg-[#0052C9] text-white hover:bg-[#004BB7] transition-colors duration-200"
            rightIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            }
          >
            Verificar RUT
          </Button>
        </div>
      </div>
    </Modal>
  );
};

