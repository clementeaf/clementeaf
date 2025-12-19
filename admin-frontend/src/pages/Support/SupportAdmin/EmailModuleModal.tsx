import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../../../components/commons';
import type { EmailModuleAccess, AccessMode } from './types';
import { availableModes } from './modesConfig';

/**
 * Props del componente EmailModuleModal
 */
interface EmailModuleModalProps {
  /**
   * Indica si el modal está abierto
   */
  isOpen: boolean;
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  /**
   * Email a editar (si es null, se está creando uno nuevo)
   */
  emailAccess?: EmailModuleAccess | null;
  /**
   * Función para guardar los cambios
   */
  onSave: (emailAccess: Omit<EmailModuleAccess, 'id' | 'invitationSent' | 'invitationSentAt'>) => void;
}

/**
 * Modal para agregar o editar acceso de email a modos del sistema
 * @param props - Props del componente EmailModuleModal
 * @returns Componente EmailModuleModal
 */
export const EmailModuleModal = ({
  isOpen,
  onClose,
  emailAccess,
  onSave
}: EmailModuleModalProps): React.ReactElement => {
  const [email, setEmail] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<AccessMode | ''>('');

  /**
   * Inicializa el estado cuando se abre el modal o cambia emailAccess
   */
  useEffect(() => {
    if (emailAccess) {
      setEmail(emailAccess.email);
      setSelectedMode(emailAccess.mode);
    } else {
      setEmail('');
      setSelectedMode('');
    }
  }, [emailAccess, isOpen]);

  /**
   * Maneja el guardado del formulario
   */
  const handleSave = (): void => {
    if (!email.trim() || !selectedMode) {
      return;
    }

    onSave({
      email: email.trim(),
      mode: selectedMode as AccessMode
    });

    // Resetear formulario
    setEmail('');
    setSelectedMode('');
    onClose();
  };

  /**
   * Valida si el formulario es válido
   */
  const isValid = email.trim().length > 0 && selectedMode !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={emailAccess ? 'Editar Acceso de Email' : 'Agregar Email y Modo de Acceso'}
      size="md"
    >
      <div className="space-y-6">
        {/* Campo de Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            className="w-full"
          />
        </div>

        {/* Selección de Modo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Modo de Acceso
          </label>
          <div className="space-y-3">
            {availableModes.map((mode) => (
              <div
                key={mode.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedMode === mode.id
                    ? 'border-[#004BB7] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="accessMode"
                    value={mode.id}
                    checked={selectedMode === mode.id}
                    onChange={() => setSelectedMode(mode.id)}
                    className="mt-1 w-4 h-4 text-[#004BB7] border-gray-300 focus:ring-[#004BB7]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {mode.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {mode.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="bg-[#004BB7] text-white hover:bg-blue-600 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailAccess ? 'Guardar Cambios' : 'Agregar Email'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
