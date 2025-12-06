/**
 * DTO para crear una sucursal
 */
export interface CreateBranchDto {
  clientId: number;
  nombre: string;
  direccion?: string;
  region?: string;
  comuna?: string;
  codigoPostal?: string;
  contactoNombre?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  isActive?: boolean;
}

