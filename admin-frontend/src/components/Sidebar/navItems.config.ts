import { routes } from '../../routes';
import homeIcon from '../../assets/home.png';
import articlesIcon from '../../assets/articles.png';
import sellsIcon from '../../assets/sells.png';
import checkIcon from '../../assets/check.png';
import type { NavItem } from './types';

/**
 * Configuración de items principales de navegación
 */
export const navItems: NavItem[] = [
  { name: 'Inicio', path: routes.home, icon: homeIcon },
  // { name: 'Oportunidades', path: routes.opportunities, icon: opportunitiesIcon }, // Hidden
  // { name: 'Artículos', path: routes.articles, icon: articlesIcon, hasSubItems: true }, // Hidden
  // { name: 'Componentes', path: routes.components, icon: articlesIcon }, // Hidden
  { name: 'Ventas', path: routes.sells, icon: sellsIcon, hasSubItems: true },
  // { name: 'Analisis', path: routes.analytics, icon: articlesIcon }, // Hidden
  { name: 'Chat', path: routes.chat, icon: articlesIcon },
  { name: 'Picking', path: routes.picking, icon: checkIcon, hasSubItems: true },
  { name: 'Productos', path: routes.productsSearch, icon: articlesIcon },
  { name: 'Soporte', path: routes.support, icon: articlesIcon },
  { name: 'Roles', path: routes.rolesManagement, icon: checkIcon, hasSubItems: true }
];

/**
 * Configuración de subitems de Ventas
 */
export const sellsSubItems: NavItem[] = [
  { name: 'Clientes', path: routes.clients, icon: checkIcon },
  { name: 'Nota de venta', path: routes.quotes, icon: checkIcon },
  // { name: 'Orden de ventas', path: routes.salesOrder, icon: checkIcon }, // Hidden
  { name: 'Cuentas por cobrar', path: routes.collections, icon: checkIcon }
];

/**
 * Configuración de subitems de Picking
 */
export const pickingSubItems: NavItem[] = [
  { name: 'Orden de picking', path: routes.pickingOrder, icon: checkIcon },
  { name: 'Métricas', path: routes.pickingMetrics, icon: checkIcon },
  { name: 'Mapa de Bodega', path: routes.pickingWarehouse, icon: checkIcon }
];

/**
 * Configuración de subitems de Roles
 */
export const rolesSubItems: NavItem[] = [
  { name: 'Roles', path: routes.rolesManagement, icon: checkIcon },
  { name: 'Usuarios', path: routes.users, icon: checkIcon }
];

