import React, { useState } from 'react';
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
 * Formatea el RUT automáticamente mientras el usuario escribe
 * Formato: 8 números, luego "-", luego un número o "k"
 * @param value - Valor ingresado por el usuario
 * @returns RUT formateado
 */
const formatRut = (value: string): string => {
  // Remover todo excepto números y k/K
  let cleanValue = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  // Limitar a 9 caracteres máximo (8 números + 1 dígito verificador)
  if (cleanValue.length > 9) {
    cleanValue = cleanValue.slice(0, 9);
  }
  
  // Si tiene 8 o menos caracteres, devolver sin guion
  if (cleanValue.length <= 8) {
    return cleanValue;
  }
  
  // Si tiene 9 caracteres, formatear: 8 números + "-" + dígito/k
  const rutNumber = cleanValue.slice(0, 8);
  const dv = cleanValue.slice(8, 9);
  
  // Solo formatear si el dígito verificador es válido (número o K)
  if (/^[\dK]$/.test(dv)) {
    return `${rutNumber}-${dv}`;
  }
  
  // Si el último carácter no es válido, devolver solo los 8 números
  return rutNumber;
};

/**
 * Valida el formato de un RUT chileno
 * @param rut - RUT a validar
 * @returns true si el formato es válido, false en caso contrario
 */
const validateRutFormat = (rut: string): boolean => {
  const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
  if (cleanRut.length !== 9) {
    return false;
  }
  
  const rutNumber = cleanRut.slice(0, 8);
  const dv = cleanRut.slice(-1);
  
  if (!/^\d{8}$/.test(rutNumber)) {
    return false;
  }
  
  if (!/^[\dK]$/.test(dv)) {
    return false;
  }
  
  return true;
};

/**
 * Componente Modal para verificar RUT
 * @param props - Props del componente VerifyRutModal
 * @returns Componente VerifyRutModal
 */
type VerificationResult = 'success' | 'error' | null;

export const VerifyRutModal = ({ isOpen, onClose }: VerifyRutModalProps): React.ReactElement => {
  const [rut, setRut] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult>(null);
  const navigate = useNavigate();

  /**
   * Maneja la verificación del RUT
   */
  const handleVerifyRut = async (): Promise<void> => {
    setError(null);
    
    if (!rut.trim()) {
      setError('El RUT es requerido');
      return;
    }

    if (!validateRutFormat(rut)) {
      setError('El formato del RUT no es válido');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Conectar con API para verificar RUT en el SII
      // Simulamos la verificación con un resultado predecible para pruebas
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simular resultado basado en el último dígito del RUT para facilitar pruebas:
      // - Si termina en número par (0, 2, 4, 6, 8) o K: éxito
      // - Si termina en número impar (1, 3, 5, 7, 9): error
      // En producción, esto vendrá de la respuesta de la API
      const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
      const lastDigit = cleanRut.slice(-1);
      
      let found: boolean;
      if (lastDigit === 'K') {
        found = true; // K = éxito
      } else {
        const digit = parseInt(lastDigit, 10);
        found = digit % 2 === 0; // Par = éxito, impar = error
      }
      
      if (found) {
        setVerificationResult('success');
      } else {
        setVerificationResult('error');
      }
    } catch (err) {
      setError('Error al verificar el RUT. Por favor, intenta nuevamente.');
      setVerificationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la continuación del registro después de verificar
   */
  const handleContinueRegistration = (): void => {
    onClose();
    navigate(routes.createClient, { state: { rut, found: verificationResult === 'success' } });
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = (): void => {
    setRut('');
    setError(null);
    setIsLoading(false);
    setVerificationResult(null);
    onClose();
  };

  /**
   * Maneja el cambio del input de RUT con formateo automático
   * @param e - Evento del input
   */
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    const formattedRut = formatRut(value);
    setRut(formattedRut);
    if (error) {
      setError(null);
    }
  };

  /**
   * Renderiza el contenido del formulario inicial
   */
  const renderInitialForm = (): React.ReactElement => (
    <>
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
          id="rut-input"
          label="RUT"
          value={rut}
          onChange={handleRutChange}
          placeholder="76.543.210-9"
          containerClassName="mb-2"
          error={error || undefined}
          disabled={isLoading}
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
          disabled={isLoading}
          className="bg-[#0052C9] text-white hover:bg-[#004BB7] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          rightIcon={
            isLoading ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
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
            )
          }
        >
          {isLoading ? 'Verificando...' : 'Verificar RUT'}
        </Button>
      </div>
    </>
  );

  /**
   * Renderiza el contenido de éxito (cliente encontrado)
   */
  const renderSuccessContent = (): React.ReactElement => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Cliente encontrado</h2>
        </div>
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
          Hemos encontrado información para este RUT en el SII. Los datos disponibles se completarán automáticamente en el formulario.
        </p>
        <p className="text-xs text-gray-500">
          Razón social, giro y estado tributario serán precargados automáticamente.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleContinueRegistration}
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
          Continuar con el registro
        </Button>
      </div>
    </>
  );

  /**
   * Renderiza el contenido de error (no encontrado)
   */
  const renderErrorContent = (): React.ReactElement => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">No se encontró información en el SII</h2>
        </div>
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
          No se encontraron datos asociados a este RUT.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Puedes continuar con el registro y completar la información manualmente.
        </p>
        <div className="flex items-start gap-2">
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
            Asegúrate de ingresar correctamente el RUT.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleContinueRegistration}
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
          Continuar con el registro
        </Button>
      </div>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        {verificationResult === 'success' && renderSuccessContent()}
        {verificationResult === 'error' && renderErrorContent()}
        {verificationResult === null && renderInitialForm()}
      </div>
    </Modal>
  );
};

