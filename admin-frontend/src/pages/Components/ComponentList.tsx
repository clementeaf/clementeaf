/**
 * Props del componente ComponentList
 */
interface ComponentListProps {
  /**
   * Componente seleccionado actualmente
   */
  selectedComponent: string | null;
  /**
   * Función para cambiar el componente seleccionado
   */
  onSelectComponent: (component: string) => void;
}

/**
 * Componente para mostrar la lista de componentes disponibles
 * @param props - Props del componente ComponentList
 * @returns Componente ComponentList
 */
export const ComponentList = ({ selectedComponent, onSelectComponent }: ComponentListProps) => {
  return (
    <div className="w-[15%] bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        <button
          onClick={() => onSelectComponent('Botones')}
          className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            selectedComponent === 'Botones'
              ? 'bg-[#004BB7] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Botones
        </button>
        <button
          onClick={() => onSelectComponent('Block')}
          className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            selectedComponent === 'Block'
              ? 'bg-[#004BB7] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Block
        </button>
      </div>
    </div>
  );
};

