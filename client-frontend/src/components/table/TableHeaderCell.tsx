import { type ReactNode } from 'react';
import type { TableHeaderCellProps, TableHeaderType } from './types';

/**
 * Renderiza el contenido por defecto de una celda del header
 * @param header - Header de la celda
 * @returns Contenido renderizado
 */
const defaultRenderHeaderCell = <TData,>(header: TableHeaderType<TData>): ReactNode => {
  if (header.isPlaceholder) {
    return null;
  }

  const canSort = header.column.getCanSort();
  const isSorted = header.column.getIsSorted();

  const handleSort = (): void => {
    if (canSort) {
      header.column.toggleSorting();
    }
  };

  return (
    <div
      className={`flex items-center gap-2 ${canSort ? 'cursor-pointer select-none' : ''}`}
      onClick={handleSort}
    >
      <span>{header.column.columnDef.header as ReactNode}</span>
      {canSort && (
        <span className="text-xs">
          {isSorted === 'asc' ? '↑' : isSorted === 'desc' ? '↓' : '↕'}
        </span>
      )}
    </div>
  );
};

/**
 * Componente para renderizar una celda del header de la tabla
 * @param props - Props del componente TableHeaderCell
 * @returns Componente TableHeaderCell
 */
export const TableHeaderCell = <TData,>({
  header,
  cellClassName = '',
  renderCell
}: TableHeaderCellProps<TData>): React.ReactElement => {
  const content = renderCell ? renderCell(header) : defaultRenderHeaderCell(header);

  return (
    <th className={cellClassName}>
      {content}
    </th>
  );
};

