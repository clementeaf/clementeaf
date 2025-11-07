import { type ReactNode } from 'react';
import type { TableCellProps, TableCellType } from './types';

/**
 * Renderiza el contenido por defecto de una celda del body
 * @param cell - Celda de la tabla
 * @returns Contenido renderizado
 */
const defaultRenderBodyCell = <TData,>(cell: TableCellType<TData>): ReactNode => {
  return cell.getValue() as ReactNode;
};

/**
 * Componente para renderizar una celda del body de la tabla
 * @param props - Props del componente TableCell
 * @returns Componente TableCell
 */
export const TableCell = <TData,>({
  cell,
  cellClassName = '',
  renderCell
}: TableCellProps<TData>): React.ReactElement => {
  const content = renderCell ? renderCell(cell) : defaultRenderBodyCell(cell);

  return (
    <td className={cellClassName}>
      {content}
    </td>
  );
};

