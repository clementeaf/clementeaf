export type SameSite = 'Lax' | 'Strict' | 'None';

export interface CookieOptions {
  path?: string;
  maxAgeSeconds?: number;
  sameSite?: SameSite;
  secure?: boolean;
}

/**
 * Guarda un valor en una cookie (client-side).
 * @param name - Nombre de la cookie
 * @param value - Valor a guardar
 * @param options - Opciones de cookie
 * @returns void
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const path = options.path ?? '/';
  const sameSite = options.sameSite ?? 'Lax';
  const secure = options.secure ?? window.location.protocol === 'https:';

  const parts: string[] = [];
  parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  parts.push(`Path=${path}`);
  parts.push(`SameSite=${sameSite}`);
  if (typeof options.maxAgeSeconds === 'number') {
    parts.push(`Max-Age=${Math.floor(options.maxAgeSeconds)}`);
  }
  if (secure) {
    parts.push('Secure');
  }

  document.cookie = parts.join('; ');
};

/**
 * Obtiene el valor de una cookie.
 * @param name - Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
export const getCookie = (name: string): string | null => {
  const encodedName = encodeURIComponent(name) + '=';
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      const rawValue = cookie.substring(encodedName.length);
      return decodeURIComponent(rawValue);
    }
  }
  return null;
};

/**
 * Elimina una cookie.
 * @param name - Nombre de la cookie
 * @param path - Path usado al crear la cookie (default: '/')
 * @returns void
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  setCookie(name, '', { path, maxAgeSeconds: 0 });
};

