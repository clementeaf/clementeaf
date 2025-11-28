import { type ColumnDef } from '@tanstack/react-table';
import { Table } from './Table';

/**
 * Props del componente DataTablePage
 */
export interface DataTablePageProps<TData> {
  /**
   * Datos a mostrar en la tabla
   */
  data: TData[];
  /**
   * Columnas de la tabla
   */
  columns: ColumnDef<TData>[];
  /**
   * Si está cargando
   */
  isLoading?: boolean;
  /**
   * Error al cargar datos
   */
  error?: Error | null;
  /**
   * Función para manejar el click en una fila
   */
  onRowClick?: (row: { original: TData }) => void;
  /**
   * Mensaje de error personalizado
   */
  errorMessage?: string;
  /**
   * Clases CSS adicionales para el contenedor de la tabla
   */
  tableContainerClassName?: string;
}

/**
 * Componente genérico para página con tabla de datos
 * @param props - Props del componente DataTablePage
 * @returns Componente DataTablePage
 */
export const DataTablePage = <TData,>({
  data,
  columns,
  isLoading = false,
  error = null,
  onRowClick,
  errorMessage = 'Error al cargar los datos',
  tableContainerClassName = ''
}: DataTablePageProps<TData>) => {
  return (
    <div className={`flex-1 overflow-auto rounded-lg shadow-sm bg-white border border-gray-200 p-4 ${tableContainerClassName}`}>
      {error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-red-500 mb-2">{errorMessage}</div>
          <div className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
        </div>
      ) : (
        <Table<TData>
          data={data}
          columns={columns}
          enableSorting={true}
          isLoading={isLoading}
          skeletonRowCount={5}
          containerClassName="w-full"
          tableClassName="w-full border-collapse"
          theadClassName="bg-gray-50 sticky top-0"
          headerRowClassName="border-b border-gray-200"
          headerCellClassName="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
          bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          bodyCellClassName="px-4 py-3 text-sm text-gray-900"
          onRowClick={onRowClick}
        />
      )}
    </div>
  );
};

