/**
 * Lista de emails de super administradores
 * Estos usuarios tienen acceso completo sin necesidad de permisos específicos
 */
const SUPER_ADMIN_EMAILS: readonly string[] = [
  'carriagada@banados.com'
  // Agregar más emails de super admins aquí
] as const;

/**
 * Verifica si un email pertenece a un super administrador
 * @param email - Email a verificar
 * @returns true si es super admin, false en caso contrario
 */
export const isSuperAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

