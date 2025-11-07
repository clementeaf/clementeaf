import type { ProductRow } from '../Inicio/columns';

/**
 * Tipo de datos para un reclamo
 */
export interface ClaimRow {
  id: string;
  billId: string;
  billNumber: string;
  productIds: string[];
  products: ProductRow[];
  description: string;
  status: 'Pendiente' | 'En revisión' | 'Resuelto' | 'Rechazado';
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipo de datos para el formulario de creación de reclamo
 */
export interface ClaimFormData {
  billId: string;
  productIds: string[];
  description: string;
}

