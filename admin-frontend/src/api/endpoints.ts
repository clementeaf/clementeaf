/**
 * Construye endpoints para un módulo
 * Devuelve rutas relativas que serán combinadas con la baseURL de apiClient
 * Nota: apiClient ya incluye el stage (/dev) en su baseURL, por lo que los endpoints
 * solo deben incluir el módulo y la ruta específica
 * @param modulePath - Ruta del módulo (ej: 'auth')
 * @param routes - Objeto con las rutas del módulo
 * @returns Objeto con endpoints relativos
 */
const buildEndpoints = <T extends Record<string, string>>(
  modulePath: string,
  routes: T
): { base: string } & T => {
  const base = modulePath;
  const endpoints: Record<string, string> = { base };
  
  for (const [key, route] of Object.entries(routes)) {
    if (route === '') {
      endpoints[key] = base;
    } else {
      endpoints[key] = `${base}/${route}`;
    }
  }
  
  return endpoints as { base: string } & T;
};

/**
 * Mapeo de endpoints del backend
 */
export const endpoints = {
  auth: buildEndpoints('auth', {
    register: 'register',
    login: 'login',
    me: 'me',
    logout: 'logout',
    refresh: 'refresh'
  }),
  clients: buildEndpoints('clients', {
    create: '',
    getById: '{id}',
    getAll: '',
    search: 'search/query',
    update: '{id}',
    delete: '{id}'
  }),
  chat: buildEndpoints('chat', {
    conversations: 'conversations',
    conversationById: 'conversations/{conversationId}',
    conversationsByUser: 'conversations/user/{userId}',
    messages: 'messages',
    messagesByConversation: 'conversations/{conversationId}/messages',
    markMessageRead: 'messages/{messageId}/read',
    markConversationRead: 'conversations/{conversationId}/messages/read',
    startTyping: 'typing/start',
    stopTyping: 'typing/stop'
  }),
  users: buildEndpoints('users', {
    getAll: '',
    getById: '{id}',
    updateRole: '{id}/role'
  }),
  tickets: buildEndpoints('tickets', {
    create: '',
    getById: '{id}',
    getAll: '',
    getByReporter: 'reporter',
    getByAssignee: 'assignee',
    update: '{id}',
    delete: '{id}',
    getPresignedUrl: 'presigned-url'
  }),
  email: buildEndpoints('email', {
    send: 'send'
  }),
  quotes: buildEndpoints('quotes', {
    create: '',
    getById: '{id}',
    getAll: '',
    getNextNumber: 'next-number/query',
    update: '{id}',
    delete: '{id}'
  }),
  products: buildEndpoints('products', {
    search: 'search/query'
  }),
  roles: buildEndpoints('roles', {
    create: '',
    getById: '{id}',
    getAll: '',
    update: '{id}',
    delete: '{id}'
  }),
  permissions: buildEndpoints('permissions', {
    getAll: '',
    getCapabilities: 'capabilities',
    sync: 'sync'
  })
} as const;

