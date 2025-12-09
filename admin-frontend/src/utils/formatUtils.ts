/**
 * Formatea un número como moneda chilena (CLP)
 * @param value - Valor numérico a formatear
 * @returns String formateado como moneda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(value);
};

