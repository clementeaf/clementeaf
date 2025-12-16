import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface RoleCapability {
  id: number;
  roleId: number;
  module: string;
  action: string;
  allowed: boolean;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  moduleScopes?: string[] | null;
  canDelegatePermissions?: boolean;
  rolePermissions?: Array<{
    id: number;
    permission: Permission;
  }>;
  roleCapabilities?: RoleCapability[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string;
  resource: string | null;
  action: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Capability {
  code: string;
  name: string;
  description: string;
  category: string;
  resource: string | null;
  action: string | null;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: number[];
  moduleScopes?: string[];
  canDelegatePermissions?: boolean;
  capabilities?: Array<{module: string; action: string; allowed?: boolean}>;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
  moduleScopes?: string[];
  canDelegatePermissions?: boolean;
  capabilities?: Array<{module: string; action: string; allowed?: boolean}>;
}

export const rolesService = {
  async getAllRoles(): Promise<Role[]> {
    const { data } = await apiClient.get<{ data: { roles: Role[] } }>(
      endpoints.roles.getAll
    );
    return data.data.roles;
  },

  async getRoleById(id: number): Promise<Role> {
    const { data } = await apiClient.get<{ data: { role: Role } }>(
      endpoints.roles.getById.replace('{id}', id.toString())
    );
    return data.data.role;
  },

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { data } = await apiClient.post<{ data: { role: Role } }>(
      endpoints.roles.create,
      createRoleDto
    );
    return data.data.role;
  },

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { data } = await apiClient.put<{ data: { role: Role } }>(
      endpoints.roles.update.replace('{id}', id.toString()),
      updateRoleDto
    );
    return data.data.role;
  },

  async deleteRole(id: number): Promise<void> {
    await apiClient.delete(
      endpoints.roles.delete.replace('{id}', id.toString())
    );
  }
};

export const permissionsService = {
  async getAllPermissions(): Promise<Permission[]> {
    const { data } = await apiClient.get<{ data: { permissions: Permission[] } }>(
      endpoints.permissions.getAll
    );
    return data.data.permissions;
  },

  async getAvailableCapabilities(): Promise<Capability[]> {
    const { data } = await apiClient.get<{ data: { capabilities: Capability[] } }>(
      endpoints.permissions.getCapabilities
    );
    return data.data.capabilities;
  },

  async syncPermissions(): Promise<Permission[]> {
    const { data } = await apiClient.post<{ data: { permissions: Permission[] } }>(
      endpoints.permissions.sync
    );
    return data.data.permissions;
  }
};

/**
 * Módulos disponibles en el sistema
 */
export const AVAILABLE_MODULES = [
  { value: 'sells', label: 'Ventas' },
  { value: 'picking', label: 'Picking' },
  { value: 'products', label: 'Productos' },
  { value: 'roles', label: 'Roles y Usuarios' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'ocr', label: 'OCR' },
  { value: 'activity', label: 'Actividad' },
  { value: 'chat', label: 'Chat' }
];

