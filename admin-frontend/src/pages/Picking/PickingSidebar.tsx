import { useState } from 'react';
import { DropdownIcon, ChevronUpIcon } from '../../components/commons/icons';

/**
 * Props del componente PickingSidebar
 */
interface PickingSidebarProps {
  /**
   * Filtros aplicados
   */
  filters: PickingFilters;
  /**
   * Función para actualizar los filtros
   */
  onFiltersChange: (filters: PickingFilters) => void;
}

/**
 * Filtros para órdenes de picking
 */
export interface PickingFilters {
  vendedor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

/**
 * Componente Sidebar para la página de Picking que actúa como panel de filtros
 * @param props - Props del componente PickingSidebar
 * @returns Componente PickingSidebar
 */
export const PickingSidebar = ({ filters, onFiltersChange }: PickingSidebarProps): React.ReactElement => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['vendedor', 'fecha']));

  /**
   * Maneja el toggle de una sección
   */
  const toggleSection = (sectionId: string): void => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  /**
   * Maneja el cambio de vendedor
   */
  const handleVendedorChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onFiltersChange({
      ...filters,
      vendedor: e.target.value || undefined
    });
  };

  /**
   * Maneja el cambio de fecha desde
   */
  const handleFechaDesdeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onFiltersChange({
      ...filters,
      fechaDesde: e.target.value || undefined
    });
  };

  /**
   * Maneja el cambio de fecha hasta
   */
  const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onFiltersChange({
      ...filters,
      fechaHasta: e.target.value || undefined
    });
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros</h2>
      <div className="flex flex-col gap-4">
        {/* Filtro por Vendedor */}
        <div>
          <button
            onClick={() => toggleSection('vendedor')}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Por vendedor</span>
            {expandedSections.has('vendedor') ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {expandedSections.has('vendedor') && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Buscar vendedor..."
                value={filters.vendedor || ''}
                onChange={handleVendedorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0052C9] focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Filtro por Fecha */}
        <div>
          <button
            onClick={() => toggleSection('fecha')}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Por fecha</span>
            {expandedSections.has('fecha') ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {expandedSections.has('fecha') && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Desde</label>
                <input
                  type="date"
                  value={filters.fechaDesde || ''}
                  onChange={handleFechaDesdeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0052C9] focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Hasta</label>
                <input
                  type="date"
                  value={filters.fechaHasta || ''}
                  onChange={handleFechaHastaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0052C9] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

