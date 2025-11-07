import type { TrainingRow } from './types';
import { mockBills } from '../Inicio/mockData';
import type { BillRow } from '../Inicio/columns';

/**
 * Genera capacitaciones basadas en los productos comprados con capacitacion: true
 * @param bills - Facturas del cliente
 * @returns Array de capacitaciones
 */
export const generateTrainings = (bills: BillRow[]): TrainingRow[] => {
  const trainings: TrainingRow[] = [];
  const trainingTitles: Record<string, string> = {
    'Producto A': 'Capacitación: Introducción a Producto A',
    'Producto B': 'Capacitación: Uso Avanzado de Producto B',
    'Producto C': 'Capacitación: Mantenimiento de Producto C',
    'Producto D': 'Capacitación: Instalación de Producto D',
    'Producto E': 'Capacitación: Configuración de Producto E',
    'Producto F': 'Capacitación: Optimización de Producto F',
    'Producto G': 'Capacitación: Seguridad en Producto G',
    'Producto H': 'Capacitación: Mejores Prácticas de Producto H'
  };

  const durations = ['15 min', '20 min', '25 min', '30 min', '35 min', '40 min'];
  const statuses: TrainingRow['status'][] = ['Disponible', 'En progreso', 'Completado'];

  bills.forEach((bill) => {
    bill.products.forEach((product) => {
      if (product.capacitacion) {
        const trainingId = `training-${bill.id}-${product.id}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const progress = status === 'En progreso' ? Math.floor(Math.random() * 80) + 10 : status === 'Completado' ? 100 : undefined;

        trainings.push({
          id: trainingId,
          productId: product.id,
          productName: product.name,
          billId: bill.id,
          billNumber: bill.number,
          title: trainingTitles[product.name] || `Capacitación: ${product.name}`,
          videoUrl: `https://example.com/videos/${trainingId}.mp4`,
          thumbnailUrl: `https://example.com/thumbnails/${trainingId}.jpg`,
          duration: durations[Math.floor(Math.random() * durations.length)],
          description: `Video de capacitación para ${product.name} relacionado con la factura ${bill.number}`,
          availableDate: bill.purchaseDate,
          status,
          progress
        });
      }
    });
  });

  return trainings.sort((a, b) => new Date(b.availableDate).getTime() - new Date(a.availableDate).getTime());
};

/**
 * Datos mock para la tabla de capacitaciones
 */
export const mockTrainings: TrainingRow[] = generateTrainings(mockBills);

