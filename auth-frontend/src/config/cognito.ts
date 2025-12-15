/**
 * Configuración de Cognito Hosted UI para OAuth (Google)
 */
export const COGNITO_DOMAIN: string =
  import.meta.env.VITE_COGNITO_DOMAIN ?? 'banados-auth-041238861016-dev.auth.us-east-1.amazoncognito.com';
export const COGNITO_CLIENT_ID: string =
  import.meta.env.VITE_COGNITO_CLIENT_ID ?? '3ido9jo5thqnl5c05vlna3c0no';
export const COGNITO_REDIRECT_URI: string =
  import.meta.env.VITE_COGNITO_REDIRECT_URI ?? `${window.location.origin}/oauth/callback`;

