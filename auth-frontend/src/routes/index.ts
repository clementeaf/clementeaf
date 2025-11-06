/**
 * Configuración de rutas de la aplicación
 */
export const routes = {
  root: '/',
  auth: {
    login: '/',
    register: '/register',
    selectApp: '/select-app'
  },
  notFound: '/*'
} as const;

