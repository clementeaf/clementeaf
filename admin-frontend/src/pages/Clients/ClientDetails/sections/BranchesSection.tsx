/**
 * Props del componente BranchesSection
 */
interface BranchesSectionProps {
  /**
   * ID del cliente
   */
  clientId: number;
}

/**
 * Sección de sucursales del cliente
 * @param props - Props del componente BranchesSection
 * @returns Componente BranchesSection
 */
export const BranchesSection = ({ clientId }: BranchesSectionProps): React.ReactElement => {
  // TODO: Implementar cuando exista el endpoint de sucursales
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Sucursales</h3>
      
      <div className="text-center py-12 text-gray-500">
        <p>No hay sucursales registradas</p>
        <button className="mt-4 text-[#004BB7] hover:text-[#003a94] text-sm font-medium">
          Añadir sucursal
        </button>
      </div>
    </div>
  );
};

