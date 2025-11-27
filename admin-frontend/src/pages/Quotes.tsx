import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FiltersPanel, SearchBar, DataTablePage, type ActionButton } from '../components/commons';
import { columns } from './Quotes/columns';
import { useAllQuotes } from '../hooks/useQuotes';
import { routes } from '../routes';
import type { QuoteRow } from './Quotes/columns';

/**
 * Página de cotizaciones
 * @returns Componente Quotes
 */
export const Quotes = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [page] = useState(1);
  const limit = 50;

  const { data: quotesData, isLoading, error, hasDataChanged } = useAllQuotes(page, limit);

  /**
   * Formatea una fecha ISO a formato DD/MM/YYYY
   * @param dateString - Fecha en formato ISO string o null
   * @returns Fecha formateada o '-' si no es válida
   */
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '-';
    }
  };

  /**
   * Mapea los datos del API a la estructura esperada por la tabla
   */
  const mappedQuotes: QuoteRow[] = quotesData?.data.map((quote) => ({
    id: quote.id.toString(),
    clienteNombre: quote.clienteNombre || '-',
    numeroCotizacion: quote.numeroCotizacion || '-',
    fecha: formatDate(quote.fecha),
    estado: quote.estado || 'borrador'
  })) || [];

  /**
   * Filtra las cotizaciones según el valor de búsqueda
   */
  const filteredQuotes = searchValue
    ? mappedQuotes.filter(quote =>
        quote.clienteNombre.toLowerCase().includes(searchValue.toLowerCase()) ||
        quote.numeroCotizacion.toLowerCase().includes(searchValue.toLowerCase())
      )
    : mappedQuotes;

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

  /**
   * Mostrar skeleton solo si está cargando y no hay datos persistidos
   */
  const hasPersistedData = quotesData && quotesData.data.length > 0;
  const shouldShowSkeleton = isLoading && (!hasPersistedData || hasDataChanged);

  const actionButtons: ActionButton[] = [
    {
      label: 'Crear cotización',
      onClick: () => navigate(routes.createQuote),
      variant: 'primary'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col p-8">
      <PageHeader title="Cotizaciones" actionButtons={actionButtons} />

      <div className="flex gap-4 flex-1 min-h-0">
        <FiltersPanel />

        <div className="flex-1 flex flex-col min-w-0">
          <SearchBar searchValue={searchValue} onSearchChange={handleSearchChange} />

          <DataTablePage<QuoteRow>
            data={filteredQuotes}
            columns={columns}
            isLoading={shouldShowSkeleton}
            error={error}
            errorMessage="Error al cargar las cotizaciones"
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
};
