import { useState, useMemo } from 'react';
import { DropdownIcon, ChevronUpIcon } from '../../components/commons/icons';
import { Input, Checkbox } from '../../components/commons';
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
   * Estados de pago disponibles
   */
  const statusOptions = [
    { id: 'por-vencer', label: 'Por vencer', min: undefined, max: -1 },
    { id: 'vence-hoy', label: 'Vence hoy', min: 0, max: 0 },
    { id: 'vencido-30', label: 'Vencido (1-30 días)', min: 1, max: 30 },
    { id: 'vencido-60', label: 'Vencido (31-60 días)', min: 31, max: 60 },
    { id: 'vencido-60-plus', label: 'Vencido (+60 días)', min: 61, max: undefined }
  ] as const;

  /**
   * Determina qué estados están seleccionados basándose en los filtros actuales
   */
  const selectedStatuses = useMemo(() => {
    const selected = new Set<string>();
    
    // Si hay múltiples rangos, verificar cada uno
    const ranges = (filters as any)?.diasVencidosRanges;
    if (Array.isArray(ranges) && ranges.length > 0) {
      ranges.forEach((range: { min?: number; max?: number }) => {
        statusOptions.forEach(option => {
          let matches = false;
          
          if (option.min === undefined && option.max === -1) {
            matches = range.min === undefined && range.max === -1;
          } else if (option.min === 0 && option.max === 0) {
            matches = range.min === 0 && range.max === 0;
          } else if (option.min === 1 && option.max === 30) {
            matches = range.min === 1 && range.max === 30;
          } else if (option.min === 31 && option.max === 60) {
            matches = range.min === 31 && range.max === 60;
          } else if (option.min === 61 && option.max === undefined) {
            matches = range.min === 61 && range.max === undefined;
          }
          
          if (matches) {
            selected.add(option.id);
          }
        });
      });
    } else if (filters.diasVencidosMin !== undefined || filters.diasVencidosMax !== undefined) {
      // Si hay filtros de días vencidos en formato antiguo, determinar qué estados coinciden
      statusOptions.forEach(option => {
        let matches = false;
        
        if (option.min === undefined && option.max === -1) {
          matches = filters.diasVencidosMax === -1;
        } else if (option.min === 0 && option.max === 0) {
          matches = filters.diasVencidosMin === 0 && filters.diasVencidosMax === 0;
        } else if (option.min === 1 && option.max === 30) {
          matches = filters.diasVencidosMin === 1 && filters.diasVencidosMax === 30;
        } else if (option.min === 31 && option.max === 60) {
          matches = filters.diasVencidosMin === 31 && filters.diasVencidosMax === 60;
        } else if (option.min === 61 && option.max === undefined) {
          matches = filters.diasVencidosMin === 61 && filters.diasVencidosMax === undefined;
        }
        
        if (matches) {
          selected.add(option.id);
        }
      });
    }
    
    return selected;
  }, [filters.diasVencidosMin, filters.diasVencidosMax, (filters as any)?.diasVencidosRanges]);

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
   * Maneja el cambio de selección de un estado de pago
   */
  const handleStatusToggle = (statusId: string): void => {
    const newSelectedStatuses = new Set(selectedStatuses);
    
    if (newSelectedStatuses.has(statusId)) {
      newSelectedStatuses.delete(statusId);
    } else {
      newSelectedStatuses.add(statusId);
    }
    
    // Si no hay estados seleccionados, limpiar el filtro
    if (newSelectedStatuses.size === 0) {
      const newFilters = { ...filters };
      newFilters.diasVencidosMin = undefined;
      newFilters.diasVencidosMax = undefined;
      onFiltersChange(newFilters);
      return;
    }
    
    // Convertir los estados seleccionados en rangos de días vencidos
    const ranges = Array.from(newSelectedStatuses)
      .map(statusId => statusOptions.find(opt => opt.id === statusId))
      .filter((opt): opt is typeof statusOptions[0] => opt !== undefined)
      .map(opt => ({
        min: opt.min,
        max: opt.max
      }));
    
    const newFilters = { ...filters };
    
    // Si solo hay un rango, usar el formato antiguo para compatibilidad
    if (ranges.length === 1) {
      newFilters.diasVencidosMin = ranges[0].min;
      newFilters.diasVencidosMax = ranges[0].max;
    } else {
      // Si hay múltiples rangos, usar el nuevo formato
      newFilters.diasVencidosMin = undefined;
      newFilters.diasVencidosMax = undefined;
      (newFilters as any).diasVencidosRanges = ranges;
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
                  label="Nombre Cliente"
                  labelClassName="text-xs text-gray-600"
                  placeholder="Ej: CLINICA ASTRA"
                  value={filters.razsoc || ''}
                  onChange={(e) => updateFilter('razsoc', e.target.value)}
                  inputClassName="w-full"
                />
              </div>
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
              {statusOptions.map((option) => {
                const isSelected = selectedStatuses.has(option.id);
                return (
                  <div
                    key={option.id}
                    className="flex items-center px-3 py-2 rounded transition-colors hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleStatusToggle(option.id)}
                      label={option.label}
                      containerClassName="w-full"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                );
              })}
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

