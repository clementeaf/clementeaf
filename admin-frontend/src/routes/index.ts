/**
 * Configuración de rutas de la aplicación admin
 */
export const routes = {
  root: '/',
  home: '/',
  articles: '/articles',
  opportunities: '/opportunities',
  components: '/components',
  sells: '/sells',
  clients: '/sells/clients',
  quotes: '/sells/quotes',
  salesOrder: '/sells/sales-order',
  notFound: '/*'
} as const;

