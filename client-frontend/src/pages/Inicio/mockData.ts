import type { BillRow, ProductRow } from './columns';

/**
 * Genera productos mock para una factura
 * @param billId - ID de la factura
 * @param count - Cantidad de productos
 * @returns Array de productos
 */
const generateProducts = (billId: string, count: number): ProductRow[] => {
  const productNames = [
    'Producto A',
    'Producto B',
    'Producto C',
    'Producto D',
    'Producto E',
    'Producto F',
    'Producto G',
    'Producto H'
  ];

  return Array.from({ length: count }, (_, i) => {
    const quantity = Math.floor(Math.random() * 10) + 1;
    const unitPrice = Math.floor(Math.random() * 50000) + 10000;
    return {
      id: `${billId}-product-${i + 1}`,
      name: productNames[i % productNames.length],
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      certificacion: Math.random() > 0.5,
      capacitacion: Math.random() > 0.5
    };
  });
};

/**
 * Datos mock para la tabla de facturas
 */
export const mockBills: BillRow[] = [
  {
    id: '1',
    number: 'FAC-001',
    purchaseDate: '2025-01-15',
    dispatchDate: '2025-01-18',
    amount: 150000,
    productCount: 3,
    paymentDate: '2025-01-20',
    paymentStatus: 'Pagado',
    products: generateProducts('1', 3)
  },
  {
    id: '2',
    number: 'FAC-002',
    purchaseDate: '2025-01-20',
    dispatchDate: '2025-01-23',
    amount: 250000,
    productCount: 4,
    paymentDate: null,
    paymentStatus: 'Por pagar',
    products: generateProducts('2', 4)
  },
  {
    id: '3',
    number: 'FAC-003',
    purchaseDate: '2025-01-25',
    dispatchDate: '2025-01-28',
    amount: 320000,
    productCount: 5,
    paymentDate: null,
    paymentStatus: 'Por pagar',
    products: generateProducts('3', 5)
  },
  {
    id: '4',
    number: 'FAC-004',
    purchaseDate: '2025-02-01',
    dispatchDate: '2025-02-04',
    amount: 180000,
    productCount: 2,
    paymentDate: '2025-02-05',
    paymentStatus: 'Pagado',
    products: generateProducts('4', 2)
  },
  {
    id: '5',
    number: 'FAC-005',
    purchaseDate: '2025-02-05',
    dispatchDate: '2025-02-08',
    amount: 450000,
    productCount: 6,
    paymentDate: null,
    paymentStatus: 'Por pagar',
    products: generateProducts('5', 6)
  },
  {
    id: '6',
    number: 'FAC-006',
    purchaseDate: '2025-02-10',
    dispatchDate: '2025-02-13',
    amount: 275000,
    productCount: 4,
    paymentDate: '2025-02-15',
    paymentStatus: 'Pagado',
    products: generateProducts('6', 4)
  },
  {
    id: '7',
    number: 'FAC-007',
    purchaseDate: '2025-02-15',
    dispatchDate: '2025-02-18',
    amount: 190000,
    productCount: 3,
    paymentDate: null,
    paymentStatus: 'Por pagar',
    products: generateProducts('7', 3)
  },
  {
    id: '8',
    number: 'FAC-008',
    purchaseDate: '2025-02-20',
    dispatchDate: '2025-02-23',
    amount: 380000,
    productCount: 5,
    paymentDate: '2025-02-25',
    paymentStatus: 'Pagado',
    products: generateProducts('8', 5)
  }
];

