import { useState } from 'react';
import { DropdownIcon, ChevronUpIcon } from '../../components/commons/icons';

/**
 * Props del componente ClientsFilters
 */
interface ClientsFiltersProps {
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Panel de filtros lateral
 * @param props - Props del componente ClientsFilters
 * @returns Componente ClientsFilters
 */
export const ClientsFilters = ({ className = '' }: ClientsFiltersProps) => {
  const [systemExpanded, setSystemExpanded] = useState(false);
  const [fieldsExpanded, setFieldsExpanded] = useState(false);

  return (
    <div className={`w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros</h2>
      <div className="flex flex-col gap-4">
        <div>
          <button
            onClick={() => setSystemExpanded(!systemExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Definidos por sistema</span>
            {systemExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {systemExpanded && (
            <div className="mt-2 pl-4 text-sm text-gray-600">
              {/* Contenido de filtros del sistema */}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => setFieldsExpanded(!fieldsExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Por campos</span>
            {fieldsExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {fieldsExpanded && (
            <div className="mt-2 pl-4 text-sm text-gray-600">
              {/* Contenido de filtros por campos */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

