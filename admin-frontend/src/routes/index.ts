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
  clientDetails: '/sells/clients/details',
  quotes: '/sells/quotes',
  createQuote: '/sells/quotes/create',
  quoteDetails: '/sells/quotes/details',
  salesOrder: '/sells/sales-order',
  collections: '/sells/collections',
  analytics: '/analytics',
  chat: '/chat',
  support: '/support',
  invoices: '/invoices',
  notFound: '/*'
} as const;

