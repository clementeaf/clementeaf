/**
 * Tipo para los modos de acceso disponibles
 */
export type AccessMode = 'ventas' | 'bodega' | 'admin';

/**
 * Tipo para representar un email con su modo de acceso asignado
 */
export interface EmailModuleAccess {
  id: string;
  email: string;
  mode: AccessMode; // Modo de acceso asignado
  invitationSent: boolean;
  invitationSentAt?: string;
}

