import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Checkbox } from '../../../components/commons';
import type { EmailModuleAccess, Module } from './types';
import { availableModules } from './modulesConfig';

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
 * Modal para agregar o editar acceso de email a módulos
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
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubModules, setSelectedSubModules] = useState<string[]>([]);

  /**
   * Inicializa el estado cuando se abre el modal o cambia emailAccess
   */
  useEffect(() => {
    if (emailAccess) {
      setEmail(emailAccess.email);
      setSelectedModules(emailAccess.modules);
      setSelectedSubModules(emailAccess.subModules);
    } else {
      setEmail('');
      setSelectedModules([]);
      setSelectedSubModules([]);
    }
  }, [emailAccess, isOpen]);

  /**
   * Maneja el cambio de selección de un módulo
   */
  const handleModuleToggle = (moduleId: string): void => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        // Si se deselecciona el módulo, también deseleccionar sus submódulos
        const module = availableModules.find((m) => m.id === moduleId);
        if (module?.subModules) {
          setSelectedSubModules((prevSub) =>
            prevSub.filter((subId) => !module.subModules?.some((sm) => sm.id === subId))
          );
        }
        return prev.filter((id) => id !== moduleId);
      }
      return [...prev, moduleId];
    });
  };

  /**
   * Maneja el cambio de selección de un submódulo
   */
  const handleSubModuleToggle = (subModuleId: string, moduleId: string): void => {
    // Si se selecciona un submódulo, asegurar que el módulo padre esté seleccionado
    if (!selectedModules.includes(moduleId)) {
      setSelectedModules((prev) => [...prev, moduleId]);
    }

    setSelectedSubModules((prev) => {
      if (prev.includes(subModuleId)) {
        return prev.filter((id) => id !== subModuleId);
      }
      return [...prev, subModuleId];
    });
  };

  /**
   * Verifica si todos los submódulos de un módulo están seleccionados
   */
  const areAllSubModulesSelected = (module: Module): boolean => {
    if (!module.subModules || module.subModules.length === 0) return false;
    return module.subModules.every((sm) => selectedSubModules.includes(sm.id));
  };

  /**
   * Maneja la selección/deselección de todos los submódulos de un módulo
   */
  const handleSelectAllSubModules = (module: Module): void => {
    if (!module.subModules) return;

    if (areAllSubModulesSelected(module)) {
      // Deseleccionar todos los submódulos
      setSelectedSubModules((prev) =>
        prev.filter((id) => !module.subModules?.some((sm) => sm.id === id))
      );
    } else {
      // Seleccionar todos los submódulos y el módulo padre
      const allSubModuleIds = module.subModules.map((sm) => sm.id);
      setSelectedSubModules((prev) => [...new Set([...prev, ...allSubModuleIds])]);
      if (!selectedModules.includes(module.id)) {
        setSelectedModules((prev) => [...prev, module.id]);
      }
    }
  };

  /**
   * Maneja el guardado del formulario
   */
  const handleSave = (): void => {
    if (!email.trim()) {
      return;
    }

    onSave({
      email: email.trim(),
      modules: selectedModules,
      subModules: selectedSubModules
    });

    // Resetear formulario
    setEmail('');
    setSelectedModules([]);
    setSelectedSubModules([]);
    onClose();
  };

  /**
   * Valida si el formulario es válido
   */
  const isValid = email.trim().length > 0 && selectedModules.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={emailAccess ? 'Editar Acceso de Email' : 'Agregar Email y Módulos'}
      size="lg"
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

        {/* Selección de Módulos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Módulos y Submódulos
          </label>
          <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
            {availableModules.map((module) => (
              <div key={module.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={selectedModules.includes(module.id)}
                    onChange={() => handleModuleToggle(module.id)}
                  />
                  <span className="text-sm font-medium text-gray-900">{module.name}</span>
                </div>

                {/* Submódulos */}
                {module.hasSubModules && module.subModules && module.subModules.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={areAllSubModulesSelected(module)}
                        onChange={() => handleSelectAllSubModules(module)}
                      />
                      <span className="text-xs text-gray-600 font-medium">Seleccionar todos</span>
                    </div>
                    {module.subModules.map((subModule) => (
                      <div key={subModule.id} className="flex items-center gap-2 ml-4">
                        <Checkbox
                          checked={selectedSubModules.includes(subModule.id)}
                          onChange={() => handleSubModuleToggle(subModule.id, module.id)}
                          disabled={!selectedModules.includes(module.id)}
                        />
                        <span
                          className={`text-sm ${
                            selectedModules.includes(module.id)
                              ? 'text-gray-700'
                              : 'text-gray-400'
                          }`}
                        >
                          {subModule.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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

