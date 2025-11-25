/**
 * URLs de los frontends según el entorno
 */

/**
 * URLs de desarrollo (localhost)
 * Nota: auth-frontend usa el puerto por defecto de Vite (5173)
 */
const DEV_URLS = {
  auth: import.meta.env.VITE_AUTH_FRONTEND_URL || 'http://localhost:5173',
  client: 'http://localhost:8500'
} as const;

/**
 * URLs de producción (CloudFront)
 */
const PROD_URLS = {
  auth: 'https://d1wdj9ggvinelv.cloudfront.net',
  client: 'https://d30lw2uu9x30lw.cloudfront.net'
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
 * @returns Objeto con las URLs de auth y client según el entorno
 */
export const getFrontendUrls = (): { auth: string; client: string } => {
  return isDevelopment() ? DEV_URLS : PROD_URLS;
};

