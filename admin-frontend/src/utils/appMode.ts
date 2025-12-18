export type AppMode = 'ventas' | 'bodega';

const STORAGE_KEY = 'adminAppMode';

/**
 * Parsea un modo desde un string.
 * @param raw - Valor crudo (por ejemplo desde query param)
 * @returns Modo válido o null
 */
export const parseAppMode = (raw: string | null): AppMode | null => {
  if (!raw) return null;
  if (raw === 'ventas' || raw === 'bodega') return raw;
  return null;
};

/**
 * Obtiene el modo guardado localmente.
 * @returns Modo guardado o null
 */
export const getStoredAppMode = (): AppMode | null => {
  try {
    return parseAppMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

/**
 * Persiste el modo de operación.
 * @param mode - Modo a guardar
 */
export const setStoredAppMode = (mode: AppMode): void => {
  window.localStorage.setItem(STORAGE_KEY, mode);
};

/**
 * Borra el modo guardado.
 */
export const clearStoredAppMode = (): void => {
  window.localStorage.removeItem(STORAGE_KEY);
};

/**
 * Obtiene la ruta de entrada por defecto según modo.
 * @param mode - Modo de operación
 * @returns Ruta por defecto
 */
export const getDefaultPathForMode = (mode: AppMode): string => {
  return mode === 'ventas' ? '/sells/quotes' : '/picking/order';
};


