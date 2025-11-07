/**
 * Tipo de datos para una capacitación (video)
 */
export interface TrainingRow {
  id: string;
  productId: string;
  productName: string;
  billId: string;
  billNumber: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  availableDate: string;
  status: 'Disponible' | 'En progreso' | 'Completado';
  progress?: number;
}

