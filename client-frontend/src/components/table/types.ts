import { type ReactNode } from 'react';
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Row,
  type HeaderGroup,
  type Header,
  type Cell
} from '@tanstack/react-table';

/**
 * Type aliases para simplificar los tipos de renderizado
 */
export type TableRowType<TData> = Row<TData>;
export type TableHeaderGroupType<TData> = HeaderGroup<TData>;
export type TableHeaderType<TData> = Header<TData, unknown>;
export type TableCellType<TData> = Cell<TData, unknown>;

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
  renderHeader?: (header: TableHeaderGroupType<TData>) => ReactNode;
  /**
   * Renderizar la fila personalizada
   */
  renderRow?: (row: TableRowType<TData>) => ReactNode;
  /**
   * Renderizar la celda del header personalizada
   */
  renderHeaderCell?: (header: TableHeaderType<TData>) => ReactNode;
  /**
   * Renderizar la celda del body personalizada
   */
  renderBodyCell?: (cell: TableCellType<TData>) => ReactNode;
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
 * Props del componente TableHeader
 */
export interface TableHeaderProps<TData> {
  /**
   * Header groups de la tabla
   */
  headerGroups: TableHeaderGroupType<TData>[];
  /**
   * Clases CSS adicionales para el thead
   */
  theadClassName?: string;
  /**
   * Clases CSS adicionales para las filas del header
   */
  headerRowClassName?: string;
  /**
   * Renderizar el header personalizado
   */
  renderHeader?: (header: TableHeaderGroupType<TData>) => ReactNode;
  /**
   * Renderizar la celda del header personalizada
   */
  renderHeaderCell?: (header: TableHeaderType<TData>) => ReactNode;
  /**
   * Clases CSS adicionales para las celdas del header
   */
  headerCellClassName?: string;
}

/**
 * Props del componente TableBody
 */
export interface TableBodyProps<TData> {
  /**
   * Filas de la tabla
   */
  rows: TableRowType<TData>[];
  /**
   * Clases CSS adicionales para el tbody
   */
  tbodyClassName?: string;
  /**
   * Clases CSS adicionales para las filas del body
   */
  bodyRowClassName?: string;
  /**
   * Clases CSS adicionales para las celdas del body
   */
  bodyCellClassName?: string;
  /**
   * Renderizar la fila personalizada
   */
  renderRow?: (row: TableRowType<TData>) => ReactNode;
  /**
   * Renderizar la celda del body personalizada
   */
  renderBodyCell?: (cell: TableCellType<TData>) => ReactNode;
}

/**
 * Props del componente TableRow
 */
export interface TableRowProps<TData> {
  /**
   * Fila de la tabla
   */
  row: TableRowType<TData>;
  /**
   * Clases CSS adicionales para la fila
   */
  rowClassName?: string;
  /**
   * Renderizar la fila personalizada
   */
  renderRow?: (row: TableRowType<TData>) => ReactNode;
  /**
   * Renderizar la celda personalizada
   */
  renderCell?: (cell: TableCellType<TData>) => ReactNode;
  /**
   * Clases CSS adicionales para las celdas
   */
  cellClassName?: string;
}

/**
 * Props del componente TableHeaderCell
 */
export interface TableHeaderCellProps<TData> {
  /**
   * Header de la celda
   */
  header: TableHeaderType<TData>;
  /**
   * Clases CSS adicionales para la celda
   */
  cellClassName?: string;
  /**
   * Renderizar la celda personalizada
   */
  renderCell?: (header: TableHeaderType<TData>) => ReactNode;
}

/**
 * Props del componente TableCell
 */
export interface TableCellProps<TData> {
  /**
   * Celda de la tabla
   */
  cell: TableCellType<TData>;
  /**
   * Clases CSS adicionales para la celda
   */
  cellClassName?: string;
  /**
   * Renderizar la celda personalizada
   */
  renderCell?: (cell: TableCellType<TData>) => ReactNode;
}

