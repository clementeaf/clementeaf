import homeIcon from '../../assets/home.png';
import type { NavItem } from './types';

/**
 * Icono de reclamos (SVG como string base64 o importar como imagen)
 * Por ahora usamos un icono genérico, puedes reemplazarlo con una imagen
 */
const reclamosIcon = homeIcon; // Temporal, reemplazar con icono de reclamos

/**
 * Icono de capacitaciones (SVG como string base64 o importar como imagen)
 * Por ahora usamos un icono genérico, puedes reemplazarlo con una imagen
 */
const capacitacionesIcon = homeIcon; // Temporal, reemplazar con icono de capacitaciones

/**
 * Configuración de items principales de navegación
 */
export const navItems: NavItem[] = [
  {
    name: 'Inicio',
    path: '/',
    icon: homeIcon
  },
  {
    name: 'Productos',
    path: '/productos',
    icon: homeIcon
  },
  {
    name: 'Carrito',
    path: '/carrito',
    icon: homeIcon
  },
  {
    name: 'Pedidos',
    path: '/pedidos',
    icon: homeIcon
  },
  {
    name: 'Facturas',
    path: '/facturas',
    icon: homeIcon
  },
  {
    name: 'Contacto',
    path: '/contacto',
    icon: homeIcon
  },
  {
    name: 'Métricas',
    path: '/metricas',
    icon: homeIcon
  },
  {
    name: 'Capacitaciones',
    path: '/capacitaciones',
    icon: capacitacionesIcon
  },
  {
    name: 'Reclamos',
    path: '/reclamos',
    icon: reclamosIcon
  }
];

/**
 * Configuración de subitems (genérico para cualquier sección)
 */
export const subItems: NavItem[] = [];

