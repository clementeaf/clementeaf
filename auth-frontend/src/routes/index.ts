/**
 * Configuración de rutas de la aplicación
 */
export const routes = {
  root: '/',
  auth: {
    login: '/',
    register: '/register'
  },
  notFound: '/*'
} as const;

