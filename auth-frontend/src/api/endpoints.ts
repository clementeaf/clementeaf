/**
 * Base URL del backend
 */
const BASE_URL = 'http://localhost:9500';

/**
 * Stage del backend (dev, prod, etc.)
 */
const STAGE = 'dev';

/**
 * Construye endpoints para un módulo
 * @param modulePath - Ruta del módulo (ej: 'auth')
 * @param routes - Objeto con las rutas del módulo
 * @returns Objeto con endpoints completos
 */
const buildEndpoints = <T extends Record<string, string>>(
  modulePath: string,
  routes: T
): { base: string } & T => {
  const base = `${BASE_URL}/${STAGE}/${modulePath}`;
  const endpoints: Record<string, string> = { base };
  
  for (const [key, route] of Object.entries(routes)) {
    endpoints[key] = `${base}/${route}`;
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
    logout: 'logout'
  })
} as const;

