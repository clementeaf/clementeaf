import { FilterChip } from '../../components/commons';
import { DropdownIcon, ChevronUpIcon } from '../../components/commons/icons';

/**
 * Componente para mostrar el contenido de Filter Chip
 * @returns Componente FilterChipContent
 */
export const FilterChipContent = () => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
      {/* Fila 1: Blanco con borde sutil vs Blanco sin borde */}
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-white border border-gray-200 text-gray-700"
      />
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#9CA3AF" />}
        className="bg-white text-gray-500"
      />

      {/* Fila 2: Blanco con borde medio vs Gris claro sin borde */}
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-white border border-gray-400 text-gray-700"
      />
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-gray-100 text-gray-600"
      />

      {/* Fila 3: Blanco con borde oscuro (activo) vs Gris claro sin borde (activo) */}
      <FilterChip
        label="Label"
        rightIcon={<ChevronUpIcon color="#6B7280" />}
        className="bg-white border border-gray-700 text-gray-700"
      />
      <FilterChip
        label="Label"
        rightIcon={<ChevronUpIcon color="#6B7280" />}
        className="bg-gray-100 text-gray-600"
      />

      {/* Fila 4: Repetición de Fila 1 */}
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-white border border-gray-200 text-gray-700"
      />
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#9CA3AF" />}
        className="bg-white text-gray-500"
      />

      {/* Fila 5: Repetición de Fila 2 */}
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-white border border-gray-400 text-gray-700"
      />
      <FilterChip
        label="Label"
        rightIcon={<DropdownIcon color="#6B7280" />}
        className="bg-gray-100 text-gray-600"
      />

      {/* Fila 6: Repetición de Fila 3 */}
      <FilterChip
        label="Label"
        rightIcon={<ChevronUpIcon color="#6B7280" />}
        className="bg-white border border-gray-700 text-gray-700"
      />
      <FilterChip
        label="Label"
        rightIcon={<ChevronUpIcon color="#6B7280" />}
        className="bg-gray-100 text-gray-600"
      />
    </div>
  );
};

