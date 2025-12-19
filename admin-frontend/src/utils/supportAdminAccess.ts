/**
 * Lista de emails autorizados para acceder al submódulo de Administración de Soporte
 */
const AUTHORIZED_EMAILS = [
  'carriagada@banados.com',
  'carriagadafalcone@gmail.com'
] as const;

/**
 * Verifica si un email está autorizado para acceder al submódulo de Administración de Soporte
 * @param email - Email del usuario a verificar
 * @returns true si el email está autorizado, false en caso contrario
 */
export const isAuthorizedForSupportAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(email as typeof AUTHORIZED_EMAILS[number]);
};

