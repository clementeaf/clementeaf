import React, { useState, type ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Row,
  type HeaderGroup,
  type Header,
  type Cell
} from '@tanstack/react-table';
import { DropdownIcon, ChevronUpIcon } from './icons';

/**
 * Type aliases para simplificar los tipos de renderizado
 */
type TableRow<TData> = Row<TData>;
type TableHeaderGroup<TData> = HeaderGroup<TData>;
type TableHeader<TData> = Header<TData, unknown>;
type TableCell<TData> = Cell<TData, unknown>;

/**
 * Props del componente Table
 */
export interface TableProps<TData> {
  /**
   * Datos de la tabla
   */
  data: TData[];
  /**
   * Definición de columnas
   */
  columns: ColumnDef<TData>[];
  /**
   * Clases CSS adicionales para el contenedor de la tabla
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para el elemento table
   */
  tableClassName?: string;
  /**
   * Clases CSS adicionales para el thead
   */
  theadClassName?: string;
  /**
   * Clases CSS adicionales para el tbody
   */
  tbodyClassName?: string;
  /**
   * Clases CSS adicionales para las filas del header
   */
  headerRowClassName?: string;
  /**
   * Clases CSS adicionales para las filas del body
   */
  bodyRowClassName?: string;
  /**
   * Clases CSS adicionales para las celdas del header
   */
  headerCellClassName?: string;
  /**
   * Clases CSS adicionales para las celdas del body
   */
  bodyCellClassName?: string;
  /**
   * Renderizar el header personalizado
   */
  renderHeader?: (header: TableHeaderGroup<TData>) => ReactNode;
  /**
   * Renderizar la fila personalizada
   */
  renderRow?: (row: TableRow<TData>) => ReactNode;
  /**
   * Renderizar la celda del header personalizada
   */
  renderHeaderCell?: (header: TableHeader<TData>) => ReactNode;
  /**
   * Renderizar la celda del body personalizada
   */
  renderBodyCell?: (cell: TableCell<TData>) => ReactNode;
  /**
   * Habilitar ordenamiento
   */
  enableSorting?: boolean;
  /**
   * Habilitar filtrado
   */
  enableFiltering?: boolean;
  /**
   * Habilitar paginación
   */
  enablePagination?: boolean;
  /**
   * Tamaño de página por defecto
   */
  defaultPageSize?: number;
  /**
   * Estado inicial de ordenamiento
   */
  initialSorting?: SortingState;
  /**
   * Estado inicial de filtros
   */
  initialColumnFilters?: ColumnFiltersState;
}

/**
 * Componente Table headless que maneja la estructura y lógica de la tabla
 * Los estilos se inyectan mediante className
 * @param props - Props del componente Table
 * @returns Componente Table
 */
export const Table = <TData,>({
  data,
  columns,
  containerClassName = '',
  tableClassName = '',
  theadClassName = '',
  tbodyClassName = '',
  headerRowClassName = '',
  bodyRowClassName = '',
  headerCellClassName = '',
  bodyCellClassName = '',
  renderHeader,
  renderRow,
  renderHeaderCell,
  renderBodyCell,
  enableSorting = false,
  enableFiltering = false,
  enablePagination = false,
  defaultPageSize = 10,
  initialSorting = [],
  initialColumnFilters = []
}: TableProps<TData>): React.ReactElement => {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);

  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: {
      sorting,
      columnFilters,
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: defaultPageSize
      }
    }
  });

  const defaultRenderHeaderCell = (header: TableHeader<TData>): ReactNode => {
    const canSort = enableSorting && header.column.getCanSort();
    const isSelectColumn = header.column.id === 'select';
    
    // Para la columna del checkbox, usar menos padding y ancho reducido
    const cellClassName = isSelectColumn 
      ? 'px-1 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
      : headerCellClassName;

    return (
      <th
        className={cellClassName}
        style={{
          width: isSelectColumn ? '40px' : header.getSize(),
          maxWidth: isSelectColumn ? '40px' : undefined,
          cursor: canSort ? 'pointer' : 'default',
        }}
        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
      >
        {header.isPlaceholder ? null : (
          <>
            {isSelectColumn ? (
              <div className="flex items-center justify-center pr-5">
                {typeof header.column.columnDef.header === 'function'
                  ? header.column.columnDef.header(header.getContext())
                  : header.column.columnDef.header}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {typeof header.column.columnDef.header === 'function'
                  ? header.column.columnDef.header(header.getContext())
                  : header.column.columnDef.header}
                {canSort && (
                  <span className="flex items-center">
                    {header.column.getIsSorted() === 'asc' ? (
                      <ChevronUpIcon color="#6B7280" />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <DropdownIcon color="#6B7280" />
                    ) : (
                      <DropdownIcon color="#9CA3AF" />
                    )}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </th>
    );
  };

  const defaultRenderBodyCell = (cell: TableCell<TData>): ReactNode => {
    const isSelectColumn = cell.column.id === 'select';
    
    // Para la columna del checkbox, usar menos padding y ancho reducido
    const cellClassName = isSelectColumn 
      ? 'px-1 py-3 text-sm text-gray-90 pr-6'
      : bodyCellClassName;

    return (
      <td 
        className={cellClassName}
        style={{
          width: isSelectColumn ? '40px' : undefined,
          maxWidth: isSelectColumn ? '40px' : undefined
        }}
      >
        {isSelectColumn ? (
          <div className="flex items-center justify-center">
            {typeof cell.column.columnDef.cell === 'function'
              ? cell.column.columnDef.cell(cell.getContext())
              : cell.getValue() as ReactNode}
          </div>
        ) : (
          <>
            {typeof cell.column.columnDef.cell === 'function'
              ? cell.column.columnDef.cell(cell.getContext())
              : cell.getValue() as ReactNode}
          </>
        )}
      </td>
    );
  };

  return (
    <div className={containerClassName}>
      <table className={tableClassName}>
        <thead className={theadClassName}>
          {table.getHeaderGroups().map((headerGroup) => {
            if (renderHeader) {
              return <React.Fragment key={headerGroup.id}>{renderHeader(headerGroup)}</React.Fragment>;
            }

            return (
              <tr key={headerGroup.id} className={headerRowClassName}>
                {headerGroup.headers.map((header) => {
                  if (renderHeaderCell) {
                    return <React.Fragment key={header.id}>{renderHeaderCell(header)}</React.Fragment>;
                  }
                  return <React.Fragment key={header.id}>{defaultRenderHeaderCell(header)}</React.Fragment>;
                })}
              </tr>
            );
          })}
        </thead>
        <tbody className={tbodyClassName}>
          {table.getRowModel().rows.map((row) => {
            if (renderRow) {
              return <React.Fragment key={row.id}>{renderRow(row)}</React.Fragment>;
            }

            return (
              <tr key={row.id} className={bodyRowClassName}>
                {row.getVisibleCells().map((cell) => {
                  if (renderBodyCell) {
                    return <React.Fragment key={cell.id}>{renderBodyCell(cell)}</React.Fragment>;
                  }
                  return <React.Fragment key={cell.id}>{defaultRenderBodyCell(cell)}</React.Fragment>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

