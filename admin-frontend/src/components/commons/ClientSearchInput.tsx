import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsService } from '../../services/clientsService';
import { SearchIcon, DropdownIcon } from './icons';
import type { Client } from '../../services/clientsService';

/**
 * Tipo de búsqueda permitido
 */
export type SearchType = 'nombre' | 'rut' | 'both';

/**
 * Props del componente ClientSearchInput
 */
interface ClientSearchInputProps {
  /**
   * Valor actual del input
   */
  value: string;
  /**
   * Función que se ejecuta cuando cambia el valor
   */
  onChange: (value: string) => void;
  /**
   * Función que se ejecuta cuando se selecciona un cliente
   */
  onClientSelect?: (client: Client) => void;
  /**
   * Placeholder del input
   */
  placeholder?: string;
  /**
   * Label del input
   */
  label?: string;
  /**
   * Clases CSS adicionales para el input
   */
  inputClassName?: string;
  /**
   * Mensaje de error
   */
  error?: string;
  /**
   * ID del input
   */
  id?: string;
  /**
   * Tipo de búsqueda: 'nombre' para buscar solo por nombre, 'rut' para buscar solo por RUT, 'both' para ambos
   */
  searchType?: SearchType;
}

/**
 * Componente de búsqueda de clientes con autocompletado
 * @param props - Props del componente ClientSearchInput
 * @returns Componente ClientSearchInput
 */
export const ClientSearchInput = ({
  value,
  onChange,
  onClientSelect,
  placeholder = 'Busca o selecciona un cliente existente',
  label,
  inputClassName = '',
  error,
  id,
  searchType = 'both'
}: ClientSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Busca clientes cuando hay un término de búsqueda
   */
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', 'search', searchType, searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const searchOptions: { nombre?: string; rut?: string; limit?: number } = { limit: 10 };
      
      if (searchType === 'nombre') {
        searchOptions.nombre = searchTerm;
      } else if (searchType === 'rut') {
        searchOptions.rut = searchTerm;
      } else {
        // 'both' - buscar en ambos campos
        searchOptions.nombre = searchTerm;
        searchOptions.rut = searchTerm;
      }

      return await clientsService.searchClients(searchOptions);
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 5
  });

  const filteredClients = clients || [];

  /**
   * Sincroniza el valor del input con el estado local
   */
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  /**
   * Cierra el dropdown cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Maneja el cambio en el input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
    setSelectedClientId(null);
  };

  /**
   * Maneja el click en el input
   */
  const handleInputClick = (): void => {
    if (filteredClients.length > 0) {
      setIsOpen(true);
    }
  };

  /**
   * Maneja la selección de un cliente
   */
  const handleClientSelect = (client: Client): void => {
    // Mostrar el valor apropiado según el tipo de búsqueda
    let displayValue = '';
    if (searchType === 'rut') {
      displayValue = client.rut || '';
    } else {
      displayValue = client.nombreCliente || client.razonSocial || '';
    }
    
    setSearchTerm(displayValue);
    onChange(displayValue);
    setSelectedClientId(client.id);
    setIsOpen(false);
    
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  /**
   * Maneja el focus del input
   */
  const handleFocus = (): void => {
    if (filteredClients.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <SearchIcon color="#9CA3AF" />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${inputClassName}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <DropdownIcon color="#6B7280" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown de resultados */}
      {isOpen && (filteredClients.length > 0 || (isLoading && searchTerm.trim().length >= 2)) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Buscando clientes...
            </div>
          ) : filteredClients.length > 0 ? (
            <ul className="py-1">
              {filteredClients.map((client) => (
                <li
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedClientId === client.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {client.nombreCliente || client.razonSocial}
                    </span>
                    {client.rut && (
                      <span className="text-xs text-gray-500">RUT: {client.rut}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron clientes
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

