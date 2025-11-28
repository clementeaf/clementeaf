import { FilterChip } from './FilterChip';
import { SearchIcon, DropdownIcon } from './icons';

/**
 * Configuración de un filtro chip
 */
export interface FilterChipConfig {
  /**
   * Label del filtro
   */
  label: string;
  /**
   * Función a ejecutar al hacer click (opcional)
   */
  onClick?: () => void;
}

/**
 * Props del componente SearchBar
 */
export interface SearchBarProps {
  /**
   * Valor del input de búsqueda
   */
  searchValue?: string;
  /**
   * Función para manejar el cambio en el input de búsqueda
   */
  onSearchChange?: (value: string) => void;
  /**
   * Placeholder del input
   */
  placeholder?: string;
  /**
   * Filtros adicionales a mostrar
   */
  filterChips?: FilterChipConfig[];
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Barra de búsqueda genérico
 * @param props - Props del componente SearchBar
 * @returns Componente SearchBar
 */
export const SearchBar = ({
  searchValue = '',
  onSearchChange,
  placeholder = 'Busca aquí...',
  filterChips = [
    { label: 'Nombre vendedor' },
    { label: 'Otro filtro' }
  ],
  className = ''
}: SearchBarProps) => {
  return (
    <div className={`flex items-center gap-4 mb-4 ${className} bg-white rounded-lg shadow-sm border border-gray-200 p-4`}>
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <SearchIcon color="#9CA3AF" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-[6px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent"
        />
      </div>
      {filterChips.map((chip, index) => (
        <FilterChip
          key={index}
          label={chip.label}
          rightIcon={<DropdownIcon color="#6B7280" />}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={chip.onClick}
        />
      ))}
    </div>
  );
};

