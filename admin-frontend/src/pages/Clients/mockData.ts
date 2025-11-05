import type { ClientRow } from './columns';

/**
 * Datos mock para la tabla de clientes
 */
export const mockClients: ClientRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `client-${i + 1}`,
  fantasyName: 'Label',
  rut: 'Label',
  segment: 'Label'
}));

