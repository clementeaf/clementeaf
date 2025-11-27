import { routes } from '../../routes';
import homeIcon from '../../assets/home.png';
import opportunitiesIcon from '../../assets/oportunities.png';
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
  { name: 'Soporte', path: routes.support, icon: articlesIcon }
];

/**
 * Configuración de subitems de Ventas
 */
export const sellsSubItems: NavItem[] = [
  { name: 'Clientes', path: routes.clients, icon: checkIcon },
  { name: 'Cotizaciones', path: routes.quotes, icon: checkIcon },
  // { name: 'Orden de ventas', path: routes.salesOrder, icon: checkIcon }, // Hidden
  { name: 'Cuentas por cobrar', path: routes.collections, icon: checkIcon }
];

