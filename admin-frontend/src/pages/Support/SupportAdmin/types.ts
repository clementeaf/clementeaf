/**
 * Tipo para módulos del sistema
 */
export interface Module {
  id: string;
  name: string;
  path: string;
  hasSubModules?: boolean;
  subModules?: SubModule[];
}

/**
 * Tipo para submódulos
 */
export interface SubModule {
  id: string;
  name: string;
  path: string;
}

/**
 * Tipo para representar un email con sus módulos asignados
 */
export interface EmailModuleAccess {
  id: string;
  email: string;
  modules: string[]; // IDs de módulos asignados
  subModules: string[]; // IDs de submódulos asignados
  invitationSent: boolean;
  invitationSentAt?: string;
}

