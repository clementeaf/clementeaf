import React, { type ReactNode } from 'react';
import type { TableBodyProps } from './types';
import { TableRow } from './TableRow';

/**
 * Props adicionales para TableBody con soporte de expansión
 */
export interface TableBodyWithExpansionProps<TData> extends TableBodyProps<TData> {
  /**
   * Renderizar el contenido expandido de una fila
   */
  renderExpandedContent?: (row: TData) => ReactNode;
}

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
  renderBodyCell,
  renderExpandedContent
}: TableBodyWithExpansionProps<TData>): React.ReactElement => {
  return (
    <tbody className={tbodyClassName}>
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <TableRow
            row={row}
            rowClassName={bodyRowClassName}
            cellClassName={bodyCellClassName}
            renderRow={renderRow}
            renderCell={renderBodyCell}
          />
          {renderExpandedContent && (
            <tr className={row.getIsExpanded() ? 'expanded-row' : 'collapsed-row'}>
              <td colSpan={row.getVisibleCells().length} className="p-0">
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    row.getIsExpanded()
                      ? 'max-h-[5000px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 py-4 bg-gray-50">
                    {renderExpandedContent(row.original)}
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  );
};

