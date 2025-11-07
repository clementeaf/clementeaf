/**
 * Props del componente ReclamosHeader
 */
interface ReclamosHeaderProps {
  /**
   * Función para crear un nuevo reclamo
   */
  onCreateClaim: () => void;
}

/**
 * Componente Header para la página de Reclamos
 * @param props - Props del componente ReclamosHeader
 * @returns Componente ReclamosHeader
 */
export const ReclamosHeader = ({ onCreateClaim }: ReclamosHeaderProps): React.ReactElement => {
  return (
    <div className="flex items-center justify-between w-full mb-4">
      <h1 className="text-2xl font-bold text-gray-800">Reclamos</h1>
      <button
        onClick={onCreateClaim}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Nuevo Reclamo
      </button>
    </div>
  );
};

