import type { ClaimRow } from './types';
import { mockBills } from '../Inicio/mockData';

/**
 * Datos mock para la tabla de reclamos
 */
export const mockClaims: ClaimRow[] = [
  {
    id: '1',
    billId: '1',
    billNumber: 'FAC-001',
    productIds: ['1-product-1', '1-product-2'],
    products: mockBills[0].products.filter((p) => ['1-product-1', '1-product-2'].includes(p.id)),
    description: 'Producto defectuoso recibido',
    status: 'Pendiente',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z'
  },
  {
    id: '2',
    billId: '2',
    billNumber: 'FAC-002',
    productIds: ['2-product-1'],
    products: mockBills[1].products.filter((p) => p.id === '2-product-1'),
    description: 'Producto no coincide con la descripción',
    status: 'En revisión',
    createdAt: '2025-02-02T14:30:00Z',
    updatedAt: '2025-02-03T09:15:00Z'
  },
  {
    id: '3',
    billId: '3',
    billNumber: 'FAC-003',
    productIds: ['3-product-1', '3-product-2', '3-product-3'],
    products: mockBills[2].products.filter((p) => ['3-product-1', '3-product-2', '3-product-3'].includes(p.id)),
    description: 'Productos dañados durante el transporte',
    status: 'Resuelto',
    createdAt: '2025-02-05T08:00:00Z',
    updatedAt: '2025-02-06T16:45:00Z'
  }
];

