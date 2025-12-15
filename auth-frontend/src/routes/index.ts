/**
 * Configuración de rutas de la aplicación
 */
export const routes = {
  root: '/',
  auth: {
    login: '/',
    register: '/register',
    selectApp: '/select-app',
    oauthCallback: '/oauth/callback'
  },
  notFound: '/*'
} as const;

