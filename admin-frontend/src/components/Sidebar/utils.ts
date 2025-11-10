import { routes } from '../../routes';
import type { NavItem } from './types';

/**
 * Verifica si una ruta está activa
 * @param path - Ruta a verificar
 * @param currentPath - Ruta actual
 * @returns true si la ruta está activa
 */
export const isActive = (path: string, currentPath: string): boolean => {
  if (path === routes.home) {
    return currentPath === routes.home;
  }
  return currentPath.startsWith(path);
};

/**
 * Verifica si la sección de Ventas está activa
 * @param currentPath - Ruta actual
 * @param sellsSubItems - Subitems de Ventas
 * @returns true si alguna subruta de Ventas está activa
 */
export const isSellsSectionActive = (currentPath: string, sellsSubItems: NavItem[]): boolean => {
  return sellsSubItems.some(item => currentPath.startsWith(item.path)) || 
         currentPath === routes.sells ||
         currentPath.startsWith(routes.sells);
};

