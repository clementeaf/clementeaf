import { FilterChip } from '../../components/commons';
import { SearchIcon, DropdownIcon } from '../../components/commons/icons';

/**
 * Props del componente QuotesSearchBar
 */
interface QuotesSearchBarProps {
  /**
   * Valor del input de búsqueda
   */
  searchValue?: string;
  /**
   * Función para manejar el cambio en el input de búsqueda
   */
  onSearchChange?: (value: string) => void;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Barra de búsqueda y filtros
 * @param props - Props del componente QuotesSearchBar
 * @returns Componente QuotesSearchBar
 */
export const QuotesSearchBar = ({
  searchValue = '',
  onSearchChange,
  className = ''
}: QuotesSearchBarProps) => {
  return (
    <div className={`flex items-center gap-4 mb-4 ${className} bg-white rounded-lg shadow-sm p-4`}>
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <SearchIcon color="#9CA3AF" />
        </div>
        <input
          type="text"
          placeholder="Busca aquí..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-[6px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent"
        />
      </div>
      <FilterChip
        label="Nombre vendedor"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      />
      <FilterChip
        label="Otro filtro"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      />
    </div>
  );
};

