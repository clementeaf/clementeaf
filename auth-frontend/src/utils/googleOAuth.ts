import { COGNITO_CLIENT_ID, COGNITO_DOMAIN, COGNITO_REDIRECT_URI } from '../config/cognito';

const PKCE_VERIFIER_STORAGE_KEY = 'pkce_code_verifier';
const OAUTH_STATE_STORAGE_KEY = 'oauth_state';

/**
 * Genera una cadena aleatoria base64url para usar como PKCE code_verifier/state
 * @param byteLength - Cantidad de bytes aleatorios
 * @returns String base64url
 */
export const generateRandomBase64UrlString = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  const binary = String.fromCharCode(...bytes);
  const base64 = window.btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

/**
 * Calcula el PKCE code_challenge (S256) para un code_verifier.
 * @param codeVerifier - Verifier en formato base64url
 * @returns code_challenge base64url
 */
export const createPkceCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  const binary = String.fromCharCode(...bytes);
  const base64 = window.btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

/**
 * Inicia el flujo OAuth con Google vía Cognito Hosted UI (Authorization Code + PKCE).
 * @returns Promise<void>
 */
export const startGoogleLogin = async (): Promise<void> => {
  if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) {
    throw new Error('Cognito Hosted UI is not configured (VITE_COGNITO_DOMAIN / VITE_COGNITO_CLIENT_ID)');
  }

  const codeVerifier = generateRandomBase64UrlString(64);
  const state = generateRandomBase64UrlString(32);
  const codeChallenge = await createPkceCodeChallenge(codeVerifier);

  sessionStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, codeVerifier);
  sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);

  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: COGNITO_REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    identity_provider: 'Google'
  });

  window.location.assign(`https://${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`);
};

/**
 * Obtiene el estado/verifier guardados para completar el callback (sin borrarlos).
 * @returns Objeto con state y codeVerifier
 */
export const getOAuthSession = (): { state: string | null; codeVerifier: string | null } => {
  const state = sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_STORAGE_KEY);
  return { state, codeVerifier };
};

/**
 * Limpia el estado/verifier guardados en sesión.
 * @returns void
 */
export const clearOAuthSession = (): void => {
  sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_STORAGE_KEY);
};

