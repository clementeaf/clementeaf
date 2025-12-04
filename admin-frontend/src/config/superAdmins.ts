/**
 * Lista de emails de usuarios super administradores
 * Estos usuarios tienen acceso completo al sistema sin necesidad de permisos explícitos
 */
export const SUPER_ADMIN_EMAILS: readonly string[] = [
  'carriagada@banados.com'
] as const;

/**
 * Verifica si un email pertenece a un super administrador
 * @param email - Email a verificar
 * @returns true si el email es de un super admin
 */
export const isSuperAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

