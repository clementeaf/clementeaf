import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FiltersPanel, SearchBar, DataTablePage, type ActionButton } from '../components/commons';
import { getQuoteColumns } from './Quotes/columns';
import { DeleteQuoteModal } from './Quotes/DeleteQuoteModal';
import { useAllQuotes, useDeleteQuote } from '../hooks/useQuotes';
import { useQuotesWebSocket } from '../hooks/useQuotesWebSocket';
import { routes } from '../routes';
import { formatDateShort } from '../utils/dateUtils';
import type { QuoteRow } from './Quotes/columns';

interface StatusOption {
  value: string;
  label: string;
  count: number;
}

interface StatusFilterListProps {
  options: StatusOption[];
  selectedStatus: string | null;
  onSelect: (value: string | null) => void;
}

/**
 * Renderiza el listado de estados para filtrar la tabla de órdenes de compra.
 * @param props - Props del componente
 * @returns Componente de filtro por estado
 */
const StatusFilterList = ({
  options,
  selectedStatus,
  onSelect
}: StatusFilterListProps): React.ReactElement => {
  const baseButton = 'w-full text-left px-2 py-1 rounded-md transition-colors duration-150';
  const selectedButton = 'bg-[#EAF2FF] text-[#004BB7]';
  const normalButton = 'hover:bg-gray-50 text-gray-700';

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${baseButton} ${selectedStatus === null ? selectedButton : normalButton}`}
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
          className={`${baseButton} ${selectedStatus === opt.value ? selectedButton : normalButton}`}
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
 * Normaliza un string para comparaciones de filtro.
 * @param raw - Valor crudo
 * @returns String normalizado
 */
const normalizeFilterValue = (raw: string): string => raw.trim();

/**
 * Obtiene el estado “mostrado” tal como se renderiza en la tabla.
 * @param row - Fila de la tabla
 * @returns Estado mostrado
 */
const getDisplayedQuoteStatus = (row: QuoteRow): string => {
  const estadoPicking = row.estadoPicking ?? null;
  if (estadoPicking === 'iniciado' || estadoPicking === 'recolectado') return 'Picking';
  if (estadoPicking === 'confirmado') return 'Confirmada';
  if (estadoPicking === 'en_ruta') return 'Despachada';
  // legacy
  if (row.estado === 'Picking') return 'Picking';
  if (row.estado === 'Confirmación') return 'Confirmada';
  if (row.estado === 'Despachado') return 'Despachada';
  return row.estado;
};

/**
 * Construye la lista de estados únicos con conteo, usando el estado mostrado.
 * @param rows - Filas de órdenes de compra
 * @returns Lista de opciones de estado
 */
const buildStatusOptions = (rows: QuoteRow[]): StatusOption[] => {
  const counts = new Map<string, number>();

  rows.forEach((r) => {
    const value = normalizeFilterValue(getDisplayedQuoteStatus(r));
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      label: value.length > 0 ? value : 'Sin estado'
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
};

/**
 * Página de órdenes de compra
 * @returns Componente Quotes
 */
export const Quotes = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRow | null>(null);
  const page = 1;
  const limit = 50;

  const { data: quotesData, isLoading, error, hasDataChanged } = useAllQuotes(page, limit);
  const deleteQuoteMutation = useDeleteQuote();

  // WebSocket para eventos de quotes (invalidación automática de queries)
  useQuotesWebSocket();

  /**
   * Mapea los datos del API a la estructura esperada por la tabla
   */
  const mappedQuotes: QuoteRow[] = quotesData?.data.map((quote) => ({
    id: quote.id.toString(),
    clienteNombre: quote.clienteNombre || '-',
    numeroCotizacion: quote.numeroCotizacion || '-',
    fecha: formatDateShort(quote.fecha),
    estado: quote.estado || 'borrador',
    estadoPicking: quote.estadoPicking ?? null
  })) || [];

  const statusOptions = useMemo<StatusOption[]>(() => buildStatusOptions(mappedQuotes), [mappedQuotes]);

  /**
   * Filtra las órdenes de compra según el valor de búsqueda y estado
   */
  const filteredQuotes = useMemo<QuoteRow[]>(() => {
    const search = searchValue.trim().toLowerCase();
    return mappedQuotes.filter((quote) => {
      const matchesSearch = search.length === 0
        ? true
        : quote.clienteNombre.toLowerCase().includes(search) ||
          quote.numeroCotizacion.toLowerCase().includes(search);

      const matchesStatus = selectedStatus === null
        ? true
        : normalizeFilterValue(getDisplayedQuoteStatus(quote)) === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [mappedQuotes, searchValue, selectedStatus]);

  /**
   * Maneja el cambio en el input de búsqueda
   */
  const handleSearchChange = (value: string): void => {
    setSearchValue(value);
  };

  /**
   * Maneja el click en una fila de la tabla
   */
  const handleRowClick = (row: { original: QuoteRow }): void => {
    const quoteId = row.original.id;
    navigate(`${routes.quoteDetails}/${quoteId}`);
  };

  const columns = getQuoteColumns({
    onDelete: (row) => {
      setQuoteToDelete(row);
      setIsDeleteOpen(true);
    }
  });

  /**
   * Mostrar skeleton solo si está cargando y no hay datos persistidos
   */
  const hasPersistedData = quotesData && quotesData.data.length > 0;
  const shouldShowSkeleton = isLoading && (!hasPersistedData || hasDataChanged);

  const actionButtons: ActionButton[] = [
    {
      label: 'Crear orden de compra',
      onClick: () => navigate(routes.createQuote),
      variant: 'primary'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col p-8">
      <PageHeader title="Órdenes de compra" actionButtons={actionButtons} />

      <div className="flex gap-4 flex-1 min-h-0">
        <FiltersPanel
          sections={[
            {
              id: 'status',
              label: 'Estado',
              content: (
                <StatusFilterList
                  options={statusOptions}
                  selectedStatus={selectedStatus}
                  onSelect={setSelectedStatus}
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

          <DataTablePage<QuoteRow>
            data={filteredQuotes}
            columns={columns}
            isLoading={shouldShowSkeleton}
            error={error}
            errorMessage="Error al cargar las órdenes de compra"
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      <DeleteQuoteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        quote={quoteToDelete}
        isLoading={deleteQuoteMutation.isPending}
        onConfirm={async (q) => {
          const id = parseInt(q.id, 10);
          if (Number.isNaN(id)) return;
          await deleteQuoteMutation.mutateAsync(id);
          setIsDeleteOpen(false);
        }}
      />
    </div>
  );
};
