import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Role } from './rolesService';

export interface DynamicRole extends Role {
  isSystemRole: boolean;
  moduleScopes: string[] | null;
  canDelegatePermissions: boolean;
}

export interface RoleCapability {
  id: number;
  roleId: number;
  module: string;
  action: string;
  allowed: boolean;
  createdAt: string;
}

export interface RoleHierarchy {
  id: number;
  parentRoleId: number;
  childRoleId: number;
  moduleScope: string | null;
  createdAt: string;
}

export interface CreateDynamicRoleDto {
  name: string;
  description?: string;
  moduleScopes?: string[];
  canDelegatePermissions?: boolean;
  capabilities?: Array<{
    module: string;
    action: string;
    allowed?: boolean;
  }>;
}

export interface AssignCapabilityDto {
  module: string;
  action: string;
  allowed?: boolean;
}

export interface SetHierarchyDto {
  childRoleId: number;
  moduleScope?: string;
}

class DynamicRolesService {
  /**
   * Crea un rol dinámico
   */
  async createDynamicRole(dto: CreateDynamicRoleDto): Promise<DynamicRole> {
    const { data } = await apiClient.post<{ data: { role: DynamicRole } }>(
      endpoints.dynamicRoles.create,
      dto
    );
    return data.data.role;
  }

  /**
   * Obtiene todos los roles dinámicos
   */
  async getDynamicRoles(): Promise<DynamicRole[]> {
    const { data } = await apiClient.get<{ data: { roles: DynamicRole[] } }>(
      endpoints.dynamicRoles.getAll
    );
    return data.data.roles;
  }

  /**
   * Actualiza un rol dinámico
   */
  async updateDynamicRole(
    id: number,
    dto: Partial<CreateDynamicRoleDto>
  ): Promise<DynamicRole> {
    const { data } = await apiClient.put<{ data: { role: DynamicRole } }>(
      endpoints.dynamicRoles.update.replace('{id}', id.toString()),
      dto
    );
    return data.data.role;
  }

  /**
   * Elimina un rol dinámico
   */
  async deleteDynamicRole(id: number): Promise<void> {
    await apiClient.delete(
      endpoints.dynamicRoles.delete.replace('{id}', id.toString())
    );
  }

  /**
   * Asigna capacidades a un rol
   */
  async assignCapabilities(
    roleId: number,
    capabilities: AssignCapabilityDto[],
    replace: boolean = false
  ): Promise<RoleCapability[]> {
    const { data } = await apiClient.post<{
      data: { capabilities: RoleCapability[] };
    }>(endpoints.dynamicRoles.assignCapabilities.replace('{id}', roleId.toString()), {
      capabilities,
      replace
    });
    return data.data.capabilities;
  }

  /**
   * Establece una jerarquía entre roles
   */
  async setRoleHierarchy(
    parentRoleId: number,
    dto: SetHierarchyDto
  ): Promise<RoleHierarchy> {
    const { data } = await apiClient.post<{ data: { hierarchy: RoleHierarchy } }>(
      endpoints.dynamicRoles.setHierarchy.replace('{id}', parentRoleId.toString()),
      dto
    );
    return data.data.hierarchy;
  }

  /**
   * Obtiene los roles subordinados
   */
  async getSubordinateRoles(parentRoleId: number): Promise<DynamicRole[]> {
    const { data } = await apiClient.get<{ data: { roles: DynamicRole[] } }>(
      endpoints.dynamicRoles.getSubordinates.replace('{id}', parentRoleId.toString())
    );
    return data.data.roles;
  }
}

export const dynamicRolesService = new DynamicRolesService();
