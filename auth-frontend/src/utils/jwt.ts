import { getCookie } from './cookies';

/**
 * Decodifica un JWT y extrae el payload
 * @param token - Token JWT a decodificar
 * @returns Payload decodificado o null si hay error
 */
export const decodeJWT = (token: string): { userId?: number; email?: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded;
  } catch (error) {
    console.error('Error decodificando JWT', error);
    return null;
  }
};

/**
 * Obtiene el email del usuario desde el token JWT
 * @returns Email del usuario o null si no se puede obtener
 */
export const getEmailFromToken = (): string | null => {
  const token = getCookie('authToken');
  if (!token) {
    return null;
  }

  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  return decoded.email || null;
};

/**
 * Lista de emails autorizados para acceso de administrador general
 */
const AUTHORIZED_ADMIN_EMAILS = [
  'carriagadafalcone@gmail.com',
  'carriagada@banados.com'
] as const;

/**
 * Verifica si un email está autorizado para acceso de administrador general
 * @param email - Email a verificar
 * @returns true si el email está autorizado, false en caso contrario
 */
export const isAuthorizedForAdminGeneral = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email as typeof AUTHORIZED_ADMIN_EMAILS[number]);
};

