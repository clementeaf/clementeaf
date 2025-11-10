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
  createClient: '/sells/clients/create',
  quotes: '/sells/quotes',
  salesOrder: '/sells/sales-order',
  analytics: '/analytics',
  chat: '/chat',
  notFound: '/*'
} as const;

