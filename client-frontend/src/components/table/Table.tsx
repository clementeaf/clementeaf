import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';
import type { TableProps } from './types';
import { useTableSorting, useTableFilters, useTableRowSelection } from './hooks';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';

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
  const [sorting, setSorting] = useTableSorting(initialSorting);
  const [columnFilters, setColumnFilters] = useTableFilters(initialColumnFilters);
  const [rowSelection, setRowSelection] = useTableRowSelection();

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

  return (
    <div className={containerClassName}>
      <table className={tableClassName}>
        <TableHeader
          headerGroups={table.getHeaderGroups()}
          theadClassName={theadClassName}
          headerRowClassName={headerRowClassName}
          headerCellClassName={headerCellClassName}
          renderHeader={renderHeader}
          renderHeaderCell={renderHeaderCell}
        />
        <TableBody
          rows={table.getRowModel().rows}
          tbodyClassName={tbodyClassName}
          bodyRowClassName={bodyRowClassName}
          bodyCellClassName={bodyCellClassName}
          renderRow={renderRow}
          renderBodyCell={renderBodyCell}
        />
      </table>
    </div>
  );
};

