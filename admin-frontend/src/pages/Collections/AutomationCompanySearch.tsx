import { useState, useMemo } from 'react';
import { SearchIcon } from '../../components/commons/icons';
import { Select } from '../../components/commons';
import type { SelectOption } from '../../components/commons';
import type { CtasPorCobrar } from '../../types/analytics';

/**
 * Empresa única de la tabla de Cuentas por Cobrar
 */
export interface CompanyFromCollections {
  rut: string;
  razsoc: string;
  cliente_email: string | null;
  cliente_telefono: string | null;
}

/**
 * Filtros de búsqueda de empresas
 */
export interface CompanySearchFilters {
  searchTerm: string;
  filterType: 'all' | 'rut' | 'nombre';
}

/**
 * Props del componente AutomationCompanySearch
 */
export interface AutomationCompanySearchProps {
  /**
   * Datos de cuentas por cobrar para extraer empresas únicas
   */
  deudasData: CtasPorCobrar[];
  /**
   * Empresas seleccionadas (por RUT)
   */
  selectedCompanies: string[];
  /**
   * Función para manejar la selección de empresas
   */
  onSelectionChange: (companyRuts: string[]) => void;
}

/**
 * Componente de búsqueda de empresas para automatización
 * @param props - Props del componente AutomationCompanySearch
 * @returns Componente AutomationCompanySearch
 */
export const AutomationCompanySearch = ({
  deudasData,
  selectedCompanies,
  onSelectionChange
}: AutomationCompanySearchProps): React.ReactElement => {
  const [filters, setFilters] = useState<CompanySearchFilters>({
    searchTerm: '',
    filterType: 'all'
  });

  /**
   * Opciones de filtro
   */
  const filterOptions: SelectOption[] = [
    { value: 'all', label: 'Todos' },
    { value: 'rut', label: 'RUT' },
    { value: 'nombre', label: 'Nombre' }
  ];

  /**
   * Extrae empresas únicas de las deudas por RUT
   */
  const uniqueCompanies = useMemo(() => {
    const companiesMap = new Map<string, CompanyFromCollections>();

    deudasData.forEach((deuda) => {
      if (deuda.rut && deuda.razsoc) {
        // Usar RUT como clave única
        if (!companiesMap.has(deuda.rut)) {
          companiesMap.set(deuda.rut, {
            rut: deuda.rut,
            razsoc: deuda.razsoc,
            cliente_email: deuda.cliente_email,
            cliente_telefono: deuda.cliente_telefono
          });
        }
      }
    });

    return Array.from(companiesMap.values());
  }, [deudasData]);

  /**
   * Filtra las empresas según los criterios de búsqueda
   * Solo muestra resultados si hay un término de búsqueda ingresado
   */
  const filteredCompanies = useMemo(() => {
    // Si no hay término de búsqueda, no mostrar resultados
    if (!filters.searchTerm.trim()) {
      return [];
    }

    const searchLower = filters.searchTerm.toLowerCase().trim();
    let filtered = uniqueCompanies;

    switch (filters.filterType) {
      case 'rut':
        filtered = filtered.filter(company =>
          company.rut?.toLowerCase().includes(searchLower)
        );
        break;
      case 'nombre':
        filtered = filtered.filter(company =>
          company.razsoc?.toLowerCase().includes(searchLower)
        );
        break;
      case 'all':
      default:
        filtered = filtered.filter(company =>
          company.rut?.toLowerCase().includes(searchLower) ||
          company.razsoc?.toLowerCase().includes(searchLower)
        );
        break;
    }

    return filtered;
  }, [uniqueCompanies, filters.searchTerm, filters.filterType]);

  /**
   * Maneja el cambio en el término de búsqueda
   */
  const handleSearchChange = (value: string): void => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  /**
   * Maneja el cambio en el tipo de filtro
   */
  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters(prev => ({ ...prev, filterType: e.target.value as CompanySearchFilters['filterType'] }));
  };

  /**
   * Maneja la selección/deselección de una empresa
   */
  const handleCompanyToggle = (companyRut: string): void => {
    if (selectedCompanies.includes(companyRut)) {
      onSelectionChange(selectedCompanies.filter(rut => rut !== companyRut));
    } else {
      onSelectionChange([...selectedCompanies, companyRut]);
    }
  };

  /**
   * Maneja la selección de todas las empresas filtradas
   */
  const handleSelectAll = (): void => {
    const allFilteredRuts = filteredCompanies.map(company => company.rut);
    const allSelected = allFilteredRuts.every(rut => selectedCompanies.includes(rut));
    
    if (allSelected) {
      // Deseleccionar todas las empresas filtradas
      onSelectionChange(selectedCompanies.filter(rut => !allFilteredRuts.includes(rut)));
    } else {
      // Seleccionar todas las empresas filtradas
      const newSelection = [...selectedCompanies];
      allFilteredRuts.forEach(rut => {
        if (!newSelection.includes(rut)) {
          newSelection.push(rut);
        }
      });
      onSelectionChange(newSelection);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar Empresa
        </label>
        
        {/* Barra de búsqueda con filtros */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <SearchIcon color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Busca por nombre, RUT, segmento..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-40">
            <Select
              value={filters.filterType}
              onChange={handleFilterTypeChange}
              options={filterOptions}
              placeholder="Filtro"
              selectClassName="h-[42px]"
            />
          </div>
        </div>

        {/* Resultados de búsqueda */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {filteredCompanies.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {filters.searchTerm ? 'No se encontraron empresas' : 'Ingresa un término de búsqueda'}
            </div>
          ) : (
            <>
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {filteredCompanies.every(c => selectedCompanies.includes(c.rut)) ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.rut}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleCompanyToggle(company.rut)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.rut)}
                        onChange={() => handleCompanyToggle(company.rut)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {company.razsoc || '-'}
                        </p>
                        <p className="text-sm text-gray-500">RUT: {company.rut || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resumen de selección */}
      {selectedCompanies.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{selectedCompanies.length}</span> empresa{selectedCompanies.length !== 1 ? 's' : ''} seleccionada{selectedCompanies.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

