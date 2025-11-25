/**
 * Detecta si estamos en desarrollo (localhost) o producción (CloudFront)
 * @returns true si estamos en desarrollo, false si estamos en producción
 */
const isDevelopment = (): boolean => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
};

/**
 * Base URL del backend según el entorno
 */
const BASE_URL = isDevelopment() 
  ? 'http://localhost:9500'
  : 'https://9hzayjhnz8.execute-api.us-east-1.amazonaws.com';

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
    logout: 'logout',
    refresh: 'refresh'
  })
} as const;

