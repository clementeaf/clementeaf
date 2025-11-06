import type { NavItem } from './types';

/**
 * Verifica si una ruta está activa
 * @param path - Ruta a verificar
 * @param currentPath - Ruta actual
 * @returns true si la ruta está activa
 */
export const isActive = (path: string, currentPath: string): boolean => {
  if (path === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(path);
};

/**
 * Verifica si una sección con subitems está activa
 * @param currentPath - Ruta actual
 * @param sectionPath - Ruta de la sección principal
 * @param subItems - Subitems de la sección
 * @returns true si alguna subruta de la sección está activa
 */
export const isSectionActive = (currentPath: string, sectionPath: string, subItems: NavItem[]): boolean => {
  return subItems.some(item => currentPath === item.path) || 
         currentPath === sectionPath;
};

