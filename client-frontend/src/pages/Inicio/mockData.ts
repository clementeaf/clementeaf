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
      total: quantity * unitPrice
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
    date: '2025-01-15',
    client: 'Cliente A',
    amount: 150000,
    status: 'Pagada',
    products: generateProducts('1', 3)
  },
  {
    id: '2',
    number: 'FAC-002',
    date: '2025-01-20',
    client: 'Cliente B',
    amount: 250000,
    status: 'Pendiente',
    products: generateProducts('2', 4)
  },
  {
    id: '3',
    number: 'FAC-003',
    date: '2025-01-25',
    client: 'Cliente C',
    amount: 320000,
    status: 'Vencida',
    products: generateProducts('3', 5)
  },
  {
    id: '4',
    number: 'FAC-004',
    date: '2025-02-01',
    client: 'Cliente D',
    amount: 180000,
    status: 'Pagada',
    products: generateProducts('4', 2)
  },
  {
    id: '5',
    number: 'FAC-005',
    date: '2025-02-05',
    client: 'Cliente E',
    amount: 450000,
    status: 'Pendiente',
    products: generateProducts('5', 6)
  },
  {
    id: '6',
    number: 'FAC-006',
    date: '2025-02-10',
    client: 'Cliente F',
    amount: 275000,
    status: 'Pagada',
    products: generateProducts('6', 4)
  },
  {
    id: '7',
    number: 'FAC-007',
    date: '2025-02-15',
    client: 'Cliente G',
    amount: 190000,
    status: 'Pendiente',
    products: generateProducts('7', 3)
  },
  {
    id: '8',
    number: 'FAC-008',
    date: '2025-02-20',
    client: 'Cliente H',
    amount: 380000,
    status: 'Vencida',
    products: generateProducts('8', 5)
  }
];

