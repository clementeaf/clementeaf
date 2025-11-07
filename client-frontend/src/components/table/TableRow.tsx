import type { ReactNode } from 'react';
import type { TableRowProps, TableRowType, TableCellType } from './types';
import { TableCell } from './TableCell';

/**
 * Renderiza el contenido por defecto de una fila
 * @param row - Fila de la tabla
 * @param cellClassName - Clases CSS para las celdas
 * @param renderCell - Función para renderizar celdas personalizadas
 * @returns Contenido renderizado
 */
const defaultRenderRow = <TData,>(
  row: TableRowType<TData>,
  cellClassName: string,
  renderCell?: (cell: TableCellType<TData>) => ReactNode
): ReactNode => {
  return row.getVisibleCells().map((cell: TableCellType<TData>) => (
    <TableCell
      key={cell.id}
      cell={cell}
      cellClassName={cellClassName}
      renderCell={renderCell}
    />
  ));
};

/**
 * Componente para renderizar una fila de la tabla
 * @param props - Props del componente TableRow
 * @returns Componente TableRow
 */
export const TableRow = <TData,>({
  row,
  rowClassName = '',
  renderRow,
  renderCell,
  cellClassName = ''
}: TableRowProps<TData>): React.ReactElement => {
  const content = renderRow
    ? renderRow(row)
    : defaultRenderRow(row, cellClassName, renderCell);

  return (
    <tr className={rowClassName}>
      {content}
    </tr>
  );
};

