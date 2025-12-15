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
  picking: '/picking',
  pickingOrder: '/picking/order',
  pickingMetrics: '/picking/metrics',
  pickingWarehouse: '/picking/warehouse',
  products: '/products',
  productsSearch: '/products/search',
  analytics: '/analytics',
  chat: '/chat',
  support: '/support',
  invoices: '/invoices',
  rolesManagement: '/roles/roles',
  createRole: '/roles/roles/create',
  permissions: '/roles/permissions',
  users: '/roles/users',
  createUser: '/roles/users/create',
  whatsapp: '/whatsapp',
  ocr: '/ocr',
  activity: '/activity',
  notFound: '/*'
} as const;

