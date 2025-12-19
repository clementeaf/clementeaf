import { routes } from '../../../routes';
import type { Module } from './types';

/**
 * Configuración de módulos disponibles en el sistema
 */
export const availableModules: Module[] = [
  {
    id: 'inicio',
    name: 'Inicio',
    path: routes.home
  },
  {
    id: 'ventas',
    name: 'Ventas',
    path: routes.sells,
    hasSubModules: true,
    subModules: [
      { id: 'ventas-clientes', name: 'Clientes', path: routes.clients },
      { id: 'ventas-nota-venta', name: 'Nota de venta', path: routes.quotes },
      { id: 'ventas-cuentas-cobrar', name: 'Cuentas por cobrar', path: routes.collections }
    ]
  },
  {
    id: 'chat',
    name: 'Chat',
    path: routes.chat
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    path: routes.whatsapp
  },
  {
    id: 'ocr',
    name: 'OCR',
    path: routes.ocr
  },
  {
    id: 'bodega',
    name: 'Bodega',
    path: routes.picking,
    hasSubModules: true,
    subModules: [
      { id: 'bodega-orden', name: 'Orden de bodega', path: routes.pickingOrder },
      { id: 'bodega-metricas', name: 'Métricas', path: routes.pickingMetrics },
      { id: 'bodega-mapa', name: 'Mapa de Bodega', path: routes.pickingWarehouse }
    ]
  },
  {
    id: 'productos',
    name: 'Productos',
    path: routes.productsSearch
  },
  {
    id: 'contabilidad',
    name: 'Contabilidad',
    path: routes.accounting
  },
  {
    id: 'soporte',
    name: 'Soporte',
    path: routes.support,
    hasSubModules: true,
    subModules: [
      { id: 'soporte-tickets', name: 'Tickets', path: routes.support },
      { id: 'soporte-admin', name: 'Administración', path: routes.supportAdmin }
    ]
  },
  {
    id: 'roles',
    name: 'Roles',
    path: routes.rolesManagement,
    hasSubModules: true,
    subModules: [
      { id: 'roles-roles', name: 'Roles', path: routes.rolesManagement },
      { id: 'roles-usuarios', name: 'Usuarios', path: routes.users }
    ]
  }
];

