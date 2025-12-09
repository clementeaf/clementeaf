import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * Sucursal de un cliente
 */
export interface Branch {
  id: number;
  clientId: number;
  nombre: string;
  direccion: string | null;
  region: string | null;
  comuna: string | null;
  codigoPostal: string | null;
  contactoNombre: string | null;
  contactoTelefono: string | null;
  contactoEmail: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

/**
 * Respuesta de sucursales por cliente
 */
export interface BranchesResponse {
  data: Branch[];
}

/**
 * Servicio para gestionar sucursales
 */
export const branchesService = {
  /**
   * Obtiene todas las sucursales de un cliente
   * @param clientId - ID del cliente
   * @param includeInactive - Incluir sucursales inactivas
   * @returns Lista de sucursales
   */
  async getBranchesByClientId(clientId: number, includeInactive: boolean = false): Promise<BranchesResponse> {
    const url = endpoints.clients.getBranches.replace('{clientId}', clientId.toString());
    const params = includeInactive ? { includeInactive: 'true' } : {};
    const { data } = await apiClient.get<{ data: BranchesResponse }>(url, { params });
    return data.data;
  },

  /**
   * Obtiene una sucursal por ID
   * @param clientId - ID del cliente
   * @param branchId - ID de la sucursal
   * @returns Sucursal encontrada
   */
  async getBranchById(clientId: number, branchId: number): Promise<Branch> {
    const url = endpoints.clients.getBranchById
      .replace('{clientId}', clientId.toString())
      .replace('{id}', branchId.toString());
    const { data } = await apiClient.get<{ data: Branch }>(url);
    return data.data;
  },

  /**
   * Crea una nueva sucursal
   * @param clientId - ID del cliente
   * @param dto - Datos de la sucursal
   * @returns Sucursal creada
   */
  async createBranch(clientId: number, dto: CreateBranchDto): Promise<Branch> {
    const url = endpoints.clients.createBranch.replace('{clientId}', clientId.toString());
    const { data } = await apiClient.post<{ data: Branch }>(url, dto);
    return data.data;
  },

  /**
   * Actualiza una sucursal
   * @param clientId - ID del cliente
   * @param branchId - ID de la sucursal
   * @param dto - Datos a actualizar
   * @returns Sucursal actualizada
   */
  async updateBranch(clientId: number, branchId: number, dto: UpdateBranchDto): Promise<Branch> {
    const url = endpoints.clients.updateBranch
      .replace('{clientId}', clientId.toString())
      .replace('{id}', branchId.toString());
    const { data } = await apiClient.put<{ data: Branch }>(url, dto);
    return data.data;
  },

  /**
   * Elimina una sucursal (soft delete)
   * @param clientId - ID del cliente
   * @param branchId - ID de la sucursal
   */
  async deleteBranch(clientId: number, branchId: number): Promise<void> {
    const url = endpoints.clients.deleteBranch
      .replace('{clientId}', clientId.toString())
      .replace('{id}', branchId.toString());
    await apiClient.delete(url);
  }
};

