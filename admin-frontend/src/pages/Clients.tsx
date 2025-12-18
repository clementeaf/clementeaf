import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FiltersPanel, SearchBar, DataTablePage, type ActionButton } from '../components/commons';
import { VerifyRutModal } from './Clients/CreateClient/VerifyRutModal';
import { columns } from './Clients/columns';
import { useAllClients } from '../hooks/useClients';
import { useClientsWebSocket } from '../hooks/useClientsWebSocket';
import { routes } from '../routes';
import { clearClientsCache } from '../utils/clearClientsCache';
import { logger } from '../utils/logger';
import type { ClientRow } from './Clients/columns';

interface SegmentOption {
  value: string;
  label: string;
  count: number;
}

interface SegmentFilterListProps {
  options: SegmentOption[];
  selectedSegment: string | null;
  onSelect: (value: string | null) => void;
}

/**
 * Renderiza el listado de segmentos para filtrar la tabla de clientes.
 * @param props - Props del componente
 * @returns Componente de filtro por segmento
 */
const SegmentFilterList = ({
  options,
  selectedSegment,
  onSelect
}: SegmentFilterListProps): React.ReactElement => {
  const baseButton =
    'w-full text-left px-2 py-1 rounded-md transition-colors duration-150';
  const selectedButton = 'bg-[#EAF2FF] text-[#004BB7]';
  const normalButton = 'hover:bg-gray-50 text-gray-700';

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${baseButton} ${selectedSegment === null ? selectedButton : normalButton}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">Todos</span>
          <span className="text-xs text-gray-500">{options.reduce((acc, o) => acc + o.count, 0)}</span>
        </div>
      </button>

      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={`${baseButton} ${selectedSegment === opt.value ? selectedButton : normalButton}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate">{opt.label}</span>
            <span className="text-xs text-gray-500">{opt.count}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

/**
 * Normaliza un segmento para uso en filtros y UI.
 * @param raw - Valor crudo desde API/tabla
 * @returns Segmento normalizado
 */
const normalizeSegment = (raw: string): string => raw.trim();

/**
 * Construye la lista de segmentos únicos con conteo.
 * @param rows - Filas de clientes
 * @returns Lista de opciones de segmentos
 */
const buildSegmentOptions = (rows: ClientRow[]): SegmentOption[] => {
  const counts = new Map<string, number>();

  rows.forEach((r) => {
    const value = normalizeSegment(r.segment ?? '');
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      label: value.length > 0 ? value : 'Sin segmento'
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
};

/**
 * Página de clientes
 * @returns Componente Clients
 */
export const Clients = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isRutModalOpen, setIsRutModalOpen] = useState(false);
  const page = 1;
  const limit = 50;

  const { data: clientsData, isLoading, error, hasDataChanged } = useAllClients(page, limit);

  // WebSocket para eventos de clientes (invalidación automática de queries)
  useClientsWebSocket();

  // Limpiar caché si hay inconsistencias (datos persistidos diferentes a API)
  useEffect(() => {
    if (hasDataChanged && clientsData) {
      logger.warn('Datos inconsistentes detectados. Limpiando caché...');
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

  const segmentOptions = useMemo<SegmentOption[]>(() => buildSegmentOptions(mappedClients), [mappedClients]);

  const filteredClients = useMemo<ClientRow[]>(() => {
    const search = searchValue.trim().toLowerCase();
    return mappedClients.filter((c) => {
      const matchesSearch = search.length === 0
        ? true
        : c.fantasyName.toLowerCase().includes(search) || c.rut.toLowerCase().includes(search);

      const matchesSegment = selectedSegment === null
        ? true
        : normalizeSegment(c.segment) === selectedSegment;

      return matchesSearch && matchesSegment;
    });
  }, [mappedClients, searchValue, selectedSegment]);

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
      label: 'Crear Nota de venta',
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
          <FiltersPanel
            sections={[
              {
                id: 'segment',
                label: 'Segmento',
                content: (
                  <SegmentFilterList
                    options={segmentOptions}
                    selectedSegment={selectedSegment}
                    onSelect={setSelectedSegment}
                  />
                )
              }
            ]}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <SearchBar
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              filterChips={[{ label: 'Nombre vendedor' }]}
            />

            <DataTablePage<ClientRow>
              data={filteredClients}
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

