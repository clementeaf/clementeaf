import type { ReactNode } from 'react';
import type { TableHeaderProps, TableHeaderGroupType, TableHeaderType } from './types';
import { TableHeaderCell } from './TableHeaderCell';

/**
 * Renderiza el contenido por defecto de un header group
 * @param headerGroup - Header group de la tabla
 * @param headerCellClassName - Clases CSS para las celdas del header
 * @param renderHeaderCell - Función para renderizar celdas del header personalizadas
 * @returns Contenido renderizado
 */
const defaultRenderHeader = <TData,>(
  headerGroup: TableHeaderGroupType<TData>,
  headerCellClassName: string,
  renderHeaderCell?: (header: TableHeaderType<TData>) => ReactNode
): ReactNode => {
  return headerGroup.headers.map((header) => (
    <TableHeaderCell
      key={header.id}
      header={header}
      cellClassName={headerCellClassName}
      renderCell={renderHeaderCell}
    />
  ));
};

/**
 * Componente para renderizar el header de la tabla
 * @param props - Props del componente TableHeader
 * @returns Componente TableHeader
 */
export const TableHeader = <TData,>({
  headerGroups,
  theadClassName = '',
  headerRowClassName = '',
  renderHeader,
  renderHeaderCell,
  headerCellClassName = ''
}: TableHeaderProps<TData>): React.ReactElement => {
  return (
    <thead className={theadClassName}>
      {headerGroups.map((headerGroup) => {
        const content = renderHeader
          ? renderHeader(headerGroup)
          : defaultRenderHeader(headerGroup, headerCellClassName, renderHeaderCell);

        return (
          <tr key={headerGroup.id} className={headerRowClassName}>
            {content}
          </tr>
        );
      })}
    </thead>
  );
};

