import { useState } from 'react';
import {
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type OnChangeFn
} from '@tanstack/react-table';

/**
 * Hook para manejar el estado de ordenamiento de la tabla
 * @param initialSorting - Estado inicial de ordenamiento
 * @returns Estado de ordenamiento y función para actualizarlo
 */
export const useTableSorting = (
  initialSorting: SortingState = []
): [SortingState, OnChangeFn<SortingState>] => {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  return [sorting, setSorting];
};

/**
 * Hook para manejar el estado de filtros de la tabla
 * @param initialFilters - Estado inicial de filtros
 * @returns Estado de filtros y función para actualizarlo
 */
export const useTableFilters = (
  initialFilters: ColumnFiltersState = []
): [ColumnFiltersState, OnChangeFn<ColumnFiltersState>] => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  return [columnFilters, setColumnFilters];
};

/**
 * Hook para manejar el estado de selección de filas
 * @returns Estado de selección y función para actualizarlo
 */
export const useTableRowSelection = (): [
  RowSelectionState,
  OnChangeFn<RowSelectionState>
] => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  return [rowSelection, setRowSelection];
};

