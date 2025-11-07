import type { BillRow } from './columns';

/**
 * Datos mock para la tabla de facturas
 */
export const mockBills: BillRow[] = [
  {
    id: '1',
    number: 'FAC-001',
    date: '2025-01-15',
    client: 'Cliente A',
    amount: 150000,
    status: 'Pagada'
  },
  {
    id: '2',
    number: 'FAC-002',
    date: '2025-01-20',
    client: 'Cliente B',
    amount: 250000,
    status: 'Pendiente'
  },
  {
    id: '3',
    number: 'FAC-003',
    date: '2025-01-25',
    client: 'Cliente C',
    amount: 320000,
    status: 'Vencida'
  },
  {
    id: '4',
    number: 'FAC-004',
    date: '2025-02-01',
    client: 'Cliente D',
    amount: 180000,
    status: 'Pagada'
  },
  {
    id: '5',
    number: 'FAC-005',
    date: '2025-02-05',
    client: 'Cliente E',
    amount: 450000,
    status: 'Pendiente'
  },
  {
    id: '6',
    number: 'FAC-006',
    date: '2025-02-10',
    client: 'Cliente F',
    amount: 275000,
    status: 'Pagada'
  },
  {
    id: '7',
    number: 'FAC-007',
    date: '2025-02-15',
    client: 'Cliente G',
    amount: 190000,
    status: 'Pendiente'
  },
  {
    id: '8',
    number: 'FAC-008',
    date: '2025-02-20',
    client: 'Cliente H',
    amount: 380000,
    status: 'Vencida'
  }
];

