/**
 * URLs de los frontends según el entorno
 */

/**
 * URLs de desarrollo (localhost)
 */
const DEV_URLS = {
  auth: 'http://localhost:8050',
  admin: 'http://localhost:8400',
  client: 'http://localhost:8500',
  sells: 'http://localhost:8600',
} as const;

/**
 * URLs de producción (CloudFront)
 */
const PROD_URLS = {
  auth: 'https://d13cunasrg048d.cloudfront.net/auth',
  admin: 'https://d13cunasrg048d.cloudfront.net',
  client: 'https://d30lw2uu9x30lw.cloudfront.net',
  sells: 'https://d30lw2uu9x30lw.cloudfront.net/sells',
} as const;

/**
 * Detecta si estamos en desarrollo (localhost) o producción (CloudFront)
 * @returns true si estamos en desarrollo, false si estamos en producción
 */
const isDevelopment = (): boolean => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Desarrollo: localhost, 127.0.0.1, o cualquier dominio local
  // Producción: dominios de CloudFront o cualquier otro dominio
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local') ||
    protocol === 'http:' && (hostname.includes('localhost') || hostname.includes('127.0.0.1'))
  );
};

/**
 * Obtiene las URLs de los frontends según el entorno actual
 * @returns Objeto con las URLs según el entorno
 */
export const getFrontendUrls = (): { auth: string; admin: string; client: string; sells: string } => {
  return isDevelopment() ? DEV_URLS : PROD_URLS;
};

/**
 * Obtiene la URL de auth-frontend
 * @returns URL de auth-frontend
 */
export const getAuthUrl = (): string => {
  return getFrontendUrls().auth;
};

