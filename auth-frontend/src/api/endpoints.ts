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
    refresh: 'refresh',
    oauthCallback: 'oauth/callback'
  })
} as const;

