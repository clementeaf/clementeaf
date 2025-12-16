import React from 'react';
import type { Capability } from '../../services/rolesService';

interface CapabilityBuilderProps {
  capabilities: Capability[];
  selectedCapabilities: Array<{module: string, action: string, allowed: boolean}>;
  onSelectionChange: (selected: Array<{module: string, action: string, allowed: boolean}>) => void;
}

export const CapabilityBuilder = ({
  capabilities,
  selectedCapabilities,
  onSelectionChange
}: CapabilityBuilderProps): React.ReactElement => {
  // Agrupar capacidades por módulo
  const groupedCapabilities = capabilities.reduce((acc, cap) => {
    const module = cap.category || 'General';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(cap);
    return acc;
  }, {} as Record<string, Capability[]>);

  /**
   * Maneja el cambio de selección de una capacidad
   */
  const handleCapabilityToggle = (
    module: string,
    action: string,
    currentAllowed: boolean
  ): void => {
    const existingIndex = selectedCapabilities.findIndex(
      cap => cap.module === module && cap.action === action
    );

    let newSelected = [...selectedCapabilities];
    
    if (existingIndex >= 0) {
      // Si ya existe, actualizar el estado de permitido/denegado
      newSelected[existingIndex] = {
        ...newSelected[existingIndex],
        allowed: !currentAllowed
      };
    } else {
      // Si no existe, agregarlo como permitido
      newSelected = [
        ...newSelected,
        { module, action, allowed: true }
      ];
    }

    onSelectionChange(newSelected);
  };

  /**
   * Verifica si una capacidad está seleccionada y su estado
   */
  const getCapabilityState = (
    module: string,
    action: string
  ): { isSelected: boolean; allowed: boolean } => {
    const selected = selectedCapabilities.find(
      cap => cap.module === module && cap.action === action
    );
    
    return selected 
      ? { isSelected: true, allowed: selected.allowed } 
      : { isSelected: false, allowed: false };
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedCapabilities).map(([module, caps]) => (
        <div key={module} className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{module}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {caps.map((cap) => {
              const { isSelected, allowed } = getCapabilityState(
                cap.category,
                cap.action || cap.name
              );
              
              return (
                <div 
                  key={`${cap.category}-${cap.action || cap.name}`}
                  className={`p-4 rounded-lg border transition-colors ${
                    isSelected 
                      ? allowed 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{cap.name}</div>
                      {cap.description && (
                        <div className="text-sm text-gray-600 mt-1">{cap.description}</div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          className={`px-3 py-1 rounded text-xs ${isSelected && !allowed ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => handleCapabilityToggle(
                            cap.category,
                            cap.action || cap.name,
                            false
                          )}
                        >
                          Denegar
                        </button>
                        
                        <button
                          className={`px-3 py-1 rounded text-xs ${isSelected && allowed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => handleCapabilityToggle(
                            cap.category,
                            cap.action || cap.name,
                            true
                          )}
                        >
                          Permitir
                        </button>
                      </div>
                      
                      {isSelected && (
                        <span className={`px-2 py-1 rounded text-xs ${allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {allowed ? 'Permitido' : 'Denegado'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};