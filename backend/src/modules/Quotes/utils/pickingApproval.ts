/**
 * Determina si una nota puede usar el flujo de picking (por compatibilidad).
 * @param estado - Estado actual de la nota de venta
 * @returns true si se considera "aprobada" para picking
 */
export const isApprovedForPicking = (estado: string): boolean => {
  // Estado canonical
  if (estado === 'aprobada') return true;
  // Estados legacy que se escribieron por el flujo anterior (Kanban -> quote.estado)
  return estado === 'Picking' || estado === 'Confirmación' || estado === 'Despachado';
};


