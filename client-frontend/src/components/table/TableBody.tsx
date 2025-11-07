import type { TableBodyProps } from './types';
import { TableRow } from './TableRow';

/**
 * Componente para renderizar el body de la tabla
 * @param props - Props del componente TableBody
 * @returns Componente TableBody
 */
export const TableBody = <TData,>({
  rows,
  tbodyClassName = '',
  bodyRowClassName = '',
  bodyCellClassName = '',
  renderRow,
  renderBodyCell
}: TableBodyProps<TData>): React.ReactElement => {
  return (
    <tbody className={tbodyClassName}>
      {rows.map((row) => (
        <TableRow
          key={row.id}
          row={row}
          rowClassName={bodyRowClassName}
          cellClassName={bodyCellClassName}
          renderRow={renderRow}
          renderCell={renderBodyCell}
        />
      ))}
    </tbody>
  );
};

