import { useState } from 'react';
import { Table } from '../components/commons';
import { ClientsHeader } from './Clients/ClientsHeader';
import { ClientsFilters } from './Clients/ClientsFilters';
import { ClientsSearchBar } from './Clients/ClientsSearchBar';
import { VerifyRutModal } from './Clients/CreateClient/VerifyRutModal';
import { columns } from './Clients/columns';
import { useAllClients } from '../hooks/useClients';
import type { ClientRow } from './Clients/columns';

/**
 * Página de clientes
 * @returns Componente Clients
 */
export const Clients = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isRutModalOpen, setIsRutModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: clientsData, isLoading, error, hasDataChanged } = useAllClients(page, limit);

  /**
   * Mapea los datos del API a la estructura esperada por la tabla
   */
  const mappedClients: ClientRow[] = clientsData?.data.map((client) => ({
    id: client.id.toString(),
    fantasyName: client.nombreCliente || client.razonSocial || '',
    rut: client.rut || '',
    segment: client.segmento || ''
  })) || [];

  /**
   * Mostrar skeleton solo si:
   * 1. Está cargando Y no hay datos persistidos (primera carga)
   * 2. Está cargando Y los datos de la API son diferentes a los persistidos (necesita actualizar)
   */
  const hasPersistedData = clientsData && clientsData.data.length > 0;
  const shouldShowSkeleton = isLoading && (!hasPersistedData || hasDataChanged);

  const handleCreateClient = (): void => {
    setIsRutModalOpen(true);
  };

  const handleCloseRutModal = (): void => {
    setIsRutModalOpen(false);
  };

  const handleSearchChange = (value: string): void => {
    setSearchValue(value);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col p-4">
        <ClientsHeader onCreateClient={handleCreateClient} />

        <div className="flex gap-4 flex-1 min-h-0">
          <ClientsFilters />

          <div className="flex-1 flex flex-col min-w-0">
            <ClientsSearchBar searchValue={searchValue} onSearchChange={handleSearchChange} />

            <div className="flex-1 overflow-auto rounded-lg shadow-sm bg-white p">
              {error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-lg text-red-500">Error al cargar los clientes</div>
                </div>
              ) : (
                <Table<ClientRow>
                  data={mappedClients}
                  columns={columns}
                  enableSorting={true}
                  isLoading={shouldShowSkeleton}
                  skeletonRowCount={5}
                  containerClassName="w-full"
                  tableClassName="w-full border-collapse"
                  theadClassName="bg-gray-50 sticky top-0"
                  headerRowClassName="border-b border-gray-200"
                  headerCellClassName="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  bodyCellClassName="px-4 py-3 text-sm text-gray-900"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <VerifyRutModal isOpen={isRutModalOpen} onClose={handleCloseRutModal} />
    </>
  );
};

