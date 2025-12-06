/**
 * DTO para actualizar una sucursal
 */
export interface UpdateBranchDto {
  nombre?: string;
  direccion?: string;
  region?: string;
  comuna?: string;
  codigoPostal?: string;
  contactoNombre?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  isActive?: boolean;
}

