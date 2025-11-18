import { useState } from 'react';
import { DropdownIcon, ChevronUpIcon } from '../../components/commons/icons';
import { Input } from '../../components/commons';
import type { QueryFilters } from '../../types/analytics';

/**
 * Props del componente CollectionsFilters
 */
interface CollectionsFiltersProps {
  /**
   * Filtros actuales
   */
  filters: Omit<QueryFilters, 'page' | 'limit'>;
  /**
   * Función para actualizar los filtros
   */
  onFiltersChange: (filters: Omit<QueryFilters, 'page' | 'limit'>) => void;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Panel de filtros lateral para Cuentas por Cobrar
 * @param props - Props del componente CollectionsFilters
 * @returns Componente CollectionsFilters
 */
export const CollectionsFilters = ({
  filters,
  onFiltersChange,
  className = ''
}: CollectionsFiltersProps) => {
  const [clientExpanded, setClientExpanded] = useState(false);
  const [datesExpanded, setDatesExpanded] = useState(false);
  const [amountExpanded, setAmountExpanded] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [daysExpanded, setDaysExpanded] = useState(false);

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = (key: keyof Omit<QueryFilters, 'page' | 'limit'>, value: string | number | undefined): void => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  /**
   * Limpia todos los filtros
   */
  const clearFilters = (): void => {
    onFiltersChange({});
  };

  /**
   * Obtiene el estado de pago basado en días vencidos
   */
  const getStatusFromDays = (diasVencidos: number | null | undefined): string => {
    if (diasVencidos === null || diasVencidos === undefined) return '';
    if (diasVencidos < 0) return 'por-vencer';
    if (diasVencidos === 0) return 'vence-hoy';
    if (diasVencidos <= 30) return 'vencido-30';
    if (diasVencidos <= 60) return 'vencido-60';
    return 'vencido-60-plus';
  };

  /**
   * Establece el rango de días vencidos basado en el estado de pago
   */
  const setStatusFilter = (status: string): void => {
    const newFilters = { ...filters };
    
    // Si se hace click en el mismo estado, limpiar el filtro
    const currentStatus = getStatusFromDays(
      filters.diasVencidosMin !== undefined && filters.diasVencidosMax !== undefined
        ? filters.diasVencidosMin === filters.diasVencidosMax ? filters.diasVencidosMin : null
        : filters.diasVencidosMax === -1 ? -1 : null
    );
    
    if (currentStatus === status) {
      newFilters.diasVencidosMin = undefined;
      newFilters.diasVencidosMax = undefined;
    } else {
      switch (status) {
        case 'por-vencer':
          newFilters.diasVencidosMin = undefined;
          newFilters.diasVencidosMax = -1;
          break;
        case 'vence-hoy':
          newFilters.diasVencidosMin = 0;
          newFilters.diasVencidosMax = 0;
          break;
        case 'vencido-30':
          newFilters.diasVencidosMin = 1;
          newFilters.diasVencidosMax = 30;
          break;
        case 'vencido-60':
          newFilters.diasVencidosMin = 31;
          newFilters.diasVencidosMax = 60;
          break;
        case 'vencido-60-plus':
          newFilters.diasVencidosMin = 61;
          newFilters.diasVencidosMax = undefined;
          break;
        default:
          newFilters.diasVencidosMin = undefined;
          newFilters.diasVencidosMax = undefined;
      }
    }
    
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {/* Filtro por Cliente/RUT */}
        <div>
          <button
            onClick={() => setClientExpanded(!clientExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Cliente</span>
            {clientExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {clientExpanded && (
            <div className="mt-2 space-y-3">
              <div>
                <Input
                  type="text"
                  label="RUT"
                  labelClassName="text-xs text-gray-600"
                  placeholder="Ej: 12345678-9"
                  value={filters.rut || ''}
                  onChange={(e) => updateFilter('rut', e.target.value)}
                  inputClassName="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filtro por Fechas */}
        <div>
          <button
            onClick={() => setDatesExpanded(!datesExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Fechas</span>
            {datesExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {datesExpanded && (
            <div className="mt-2 space-y-3">
              <div>
                <Input
                  type="date"
                  label="Fecha desde"
                  labelClassName="text-xs text-gray-600"
                  value={filters.fechaDesde || ''}
                  onChange={(e) => updateFilter('fechaDesde', e.target.value)}
                  inputClassName="w-full"
                />
              </div>
              <div>
                <Input
                  type="date"
                  label="Fecha hasta"
                  labelClassName="text-xs text-gray-600"
                  value={filters.fechaHasta || ''}
                  onChange={(e) => updateFilter('fechaHasta', e.target.value)}
                  inputClassName="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filtro por Monto */}
        <div>
          <button
            onClick={() => setAmountExpanded(!amountExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Monto de Deuda</span>
            {amountExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {amountExpanded && (
            <div className="mt-2 space-y-3">
              <div>
                <Input
                  type="number"
                  label="Monto mínimo"
                  labelClassName="text-xs text-gray-600"
                  placeholder="Ej: 100000"
                  value={filters.deudaMin || ''}
                  onChange={(e) => updateFilter('deudaMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  inputClassName="w-full"
                />
              </div>
              <div>
                <Input
                  type="number"
                  label="Monto máximo"
                  labelClassName="text-xs text-gray-600"
                  placeholder="Ej: 1000000"
                  value={filters.deudaMax || ''}
                  onChange={(e) => updateFilter('deudaMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  inputClassName="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filtro por Estado de Pago */}
        <div>
          <button
            onClick={() => setStatusExpanded(!statusExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Estado de Pago</span>
            {statusExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {statusExpanded && (
            <div className="mt-2 space-y-2">
              <button
                onClick={() => setStatusFilter('por-vencer')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  filters.diasVencidosMax === -1 ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                Por vencer
              </button>
              <button
                onClick={() => setStatusFilter('vence-hoy')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  filters.diasVencidosMin === 0 && filters.diasVencidosMax === 0 ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-50'
                }`}
              >
                Vence hoy
              </button>
              <button
                onClick={() => setStatusFilter('vencido-30')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  filters.diasVencidosMin === 1 && filters.diasVencidosMax === 30 ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50'
                }`}
              >
                Vencido (1-30 días)
              </button>
              <button
                onClick={() => setStatusFilter('vencido-60')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  filters.diasVencidosMin === 31 && filters.diasVencidosMax === 60 ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
                }`}
              >
                Vencido (31-60 días)
              </button>
              <button
                onClick={() => setStatusFilter('vencido-60-plus')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  filters.diasVencidosMin === 61 ? 'bg-red-100 text-red-800' : 'hover:bg-gray-50'
                }`}
              >
                Vencido (+60 días)
              </button>
            </div>
          )}
        </div>

        {/* Filtro por Días Vencidos (rango personalizado) */}
        <div>
          <button
            onClick={() => setDaysExpanded(!daysExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Días Vencidos</span>
            {daysExpanded ? (
              <ChevronUpIcon color="#6B7280" />
            ) : (
              <DropdownIcon color="#6B7280" />
            )}
          </button>
          {daysExpanded && (
            <div className="mt-2 space-y-3">
              <div>
                <Input
                  type="number"
                  label="Días mínimo"
                  labelClassName="text-xs text-gray-600"
                  placeholder="Ej: 0"
                  value={filters.diasVencidosMin !== undefined ? filters.diasVencidosMin : ''}
                  onChange={(e) => updateFilter('diasVencidosMin', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  inputClassName="w-full"
                />
              </div>
              <div>
                <Input
                  type="number"
                  label="Días máximo"
                  labelClassName="text-xs text-gray-600"
                  placeholder="Ej: 30"
                  value={filters.diasVencidosMax !== undefined ? filters.diasVencidosMax : ''}
                  onChange={(e) => updateFilter('diasVencidosMax', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  inputClassName="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

