import type { HomeOrder } from './types';

/**
 * Datos de ejemplo para órdenes del dashboard de inicio
 * Estos datos se moverán a un hook/API en producción
 */
export const MOCK_HOME_ORDERS: HomeOrder[] = [
  // Nota de Venta
  {
    id: '1',
    codigoOrden: 'NV-001',
    fechaHoraOrden: new Date().toISOString(),
    cliente: 'Cliente A',
    vendedor: 'Juan Pérez',
    monto: 150000,
    estado: 'Nota de Venta'
  },
  {
    id: '2',
    codigoOrden: 'NV-002',
    fechaHoraOrden: new Date(Date.now() - 86400000).toISOString(),
    cliente: 'Cliente B',
    vendedor: 'María González',
    monto: 250000,
    estado: 'Nota de Venta'
  },
  // Picking
  {
    id: '3',
    codigoOrden: 'NV-003',
    fechaHoraOrden: new Date(Date.now() - 172800000).toISOString(),
    cliente: 'Cliente C',
    vendedor: 'Carlos Rodríguez',
    monto: 180000,
    estado: 'Picking'
  },
  {
    id: '4',
    codigoOrden: 'NV-004',
    fechaHoraOrden: new Date(Date.now() - 259200000).toISOString(),
    cliente: 'Cliente D',
    vendedor: 'Ana Martínez',
    monto: 320000,
    estado: 'Picking'
  },
  // Factura
  {
    id: '5',
    codigoOrden: 'NV-005',
    fechaHoraOrden: new Date(Date.now() - 345600000).toISOString(),
    cliente: 'Cliente E',
    vendedor: 'Pedro Sánchez',
    monto: 450000,
    estado: 'Factura'
  },
  // Ruta
  {
    id: '6',
    codigoOrden: 'NV-006',
    fechaHoraOrden: new Date(Date.now() - 432000000).toISOString(),
    cliente: 'Cliente F',
    vendedor: 'Laura Fernández',
    monto: 280000,
    estado: 'Ruta'
  },
  {
    id: '7',
    codigoOrden: 'NV-007',
    fechaHoraOrden: new Date(Date.now() - 518400000).toISOString(),
    cliente: 'Cliente G',
    vendedor: 'Roberto López',
    monto: 195000,
    estado: 'Ruta'
  }
];

