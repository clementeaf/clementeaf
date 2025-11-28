import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FiltersPanel, SearchBar, DataTablePage, type ActionButton } from '../components/commons';
import { VerifyRutModal } from './Clients/CreateClient/VerifyRutModal';
import { columns } from './Clients/columns';
import { useAllClients } from '../hooks/useClients';
import { routes } from '../routes';
import { clearClientsCache } from '../utils/clearClientsCache';
import type { ClientRow } from './Clients/columns';

/**
 * Página de clientes
 * @returns Componente Clients
 */
export const Clients = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isRutModalOpen, setIsRutModalOpen] = useState(false);
  const [page] = useState(1);
  const limit = 50;

  const { data: clientsData, isLoading, error, hasDataChanged } = useAllClients(page, limit);

  // Limpiar caché si hay inconsistencias (datos persistidos diferentes a API)
  useEffect(() => {
    if (hasDataChanged && clientsData) {
      console.log('⚠️ Datos inconsistentes detectados. Limpiando caché...');
      clearClientsCache();
    }
  }, [hasDataChanged, clientsData]);

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

  /**
   * Maneja el click en una fila de la tabla
   */
  const handleRowClick = (row: { original: ClientRow }): void => {
    const clientId = row.original.id;
    console.log('Click en fila - ID del cliente:', clientId, 'Datos completos:', row.original);
    navigate(`${routes.clientDetails}/${clientId}`);
  };

  const actionButtons: ActionButton[] = [
    {
      label: 'Crear orden de compra',
      onClick: () => navigate(routes.createQuote),
      variant: 'secondary'
    },
    {
      label: 'Crear cliente',
      onClick: handleCreateClient,
      variant: 'primary'
    }
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col p-4">
        <PageHeader title="Clientes" actionButtons={actionButtons} />

        <div className="flex gap-4 flex-1 min-h-0">
          <FiltersPanel />

          <div className="flex-1 flex flex-col min-w-0">
            <SearchBar searchValue={searchValue} onSearchChange={handleSearchChange} />

            <DataTablePage<ClientRow>
              data={mappedClients}
              columns={columns}
              isLoading={shouldShowSkeleton}
              error={error}
              errorMessage="Error al cargar los clientes"
              onRowClick={handleRowClick}
            />
          </div>
        </div>
      </div>
      <VerifyRutModal isOpen={isRutModalOpen} onClose={handleCloseRutModal} />
    </>
  );
};

