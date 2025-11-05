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
  { name: 'Oportunidades', path: routes.opportunities, icon: opportunitiesIcon },
  { name: 'Artículos', path: routes.articles, icon: articlesIcon, hasSubItems: true },
  { name: 'Ventas', path: routes.sells, icon: sellsIcon, hasSubItems: true }
];

/**
 * Configuración de subitems de Ventas
 */
export const sellsSubItems: NavItem[] = [
  { name: 'Clientes', path: routes.clients, icon: checkIcon },
  { name: 'Cotizaciones', path: routes.quotes, icon: checkIcon },
  { name: 'Orden de ventas', path: routes.salesOrder, icon: checkIcon }
];

