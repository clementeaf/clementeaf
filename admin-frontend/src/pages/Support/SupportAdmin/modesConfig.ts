import type { AccessMode } from './types';

/**
 * Configuración de modos de acceso disponibles
 */
export const availableModes: Array<{ id: AccessMode; name: string; description: string }> = [
  {
    id: 'ventas',
    name: 'Ventas',
    description: 'Acceso a módulos de Ventas, Productos, Soporte y Roles'
  },
  {
    id: 'bodega',
    name: 'Bodega',
    description: 'Acceso a módulos de Bodega, Productos, Soporte y Roles'
  },
  {
    id: 'completo',
    name: 'Completo',
    description: 'Acceso a Inicio, Ventas, Bodega, Productos, Roles y Soporte (Tickets)'
  },
  {
    id: 'admin',
    name: 'Admin General',
    description: 'Acceso completo a todos los módulos sin restricciones'
  }
];

