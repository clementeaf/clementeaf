import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/commons';
import { QuotesHeader } from './Quotes/QuotesHeader';
import { QuotesFilters } from './Quotes/QuotesFilters';
import { QuotesSearchBar } from './Quotes/QuotesSearchBar';
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

  // Debug: Log para verificar que se está llamando la API
  useEffect(() => {
    console.log('Quotes - quotesData:', quotesData);
    console.log('Quotes - isLoading:', isLoading);
    console.log('Quotes - error:', error);
  }, [quotesData, isLoading, error]);

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

  return (
    <>
      <div className="w-full h-full flex flex-col p-8">
        <QuotesHeader />

        <div className="flex gap-4 flex-1 min-h-0">
          <QuotesFilters />

          <div className="flex-1 flex flex-col min-w-0">
            <QuotesSearchBar searchValue={searchValue} onSearchChange={handleSearchChange} />

            <div className="flex-1 overflow-auto rounded-lg shadow-sm bg-white p-4">
              {error ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="text-lg text-red-500 mb-2">Error al cargar las cotizaciones</div>
                  <div className="text-sm text-gray-500">
                    {error instanceof Error ? error.message : 'Error desconocido'}
                  </div>
                </div>
              ) : (
                <Table<QuoteRow>
                  data={filteredQuotes}
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
                  onRowClick={handleRowClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
