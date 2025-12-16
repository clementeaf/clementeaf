import { AppDataSource } from '../../../config/database';
import { Role } from '../entities/Role.entity';
import { RoleCapability } from '../entities/RoleCapability.entity';
import { RoleHierarchy } from '../entities/RoleHierarchy.entity';
import { User } from '../../Users/entities/User.entity';

export interface CreateDynamicRoleDto {
  name: string;
  description?: string;
  moduleScopes?: string[]; // ["picking", "ventas", "productos"]
  canDelegatePermissions?: boolean;
  capabilities?: Array<{
    module: string;
    action: string;
    allowed?: boolean;
  }>;
}

export interface UpdateDynamicRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  moduleScopes?: string[];
  canDelegatePermissions?: boolean;
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

/**
 * Servicio para gestionar roles dinámicos con capacidades y jerarquías
 */
export class DynamicRolesService {
  private get roleRepository() {
    return AppDataSource.getRepository(Role);
  }

  private get capabilityRepository() {
    return AppDataSource.getRepository(RoleCapability);
  }

  private get hierarchyRepository() {
    return AppDataSource.getRepository(RoleHierarchy);
  }

  /**
   * Crea un rol dinámico con capacidades configurables
   */
  async createDynamicRole(dto: CreateDynamicRoleDto): Promise<Role> {
    // Verificar que no exista un rol con el mismo nombre
    const existingRole = await this.roleRepository.findOne({
      where: { name: dto.name }
    });

    if (existingRole) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    // Crear rol
    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description || null,
      isActive: true,
      isSystemRole: false, // Roles dinámicos no son del sistema
      moduleScopes: dto.moduleScopes || null,
      canDelegatePermissions: dto.canDelegatePermissions || false
    });

    const savedRole = await this.roleRepository.save(role);

    // Asignar capacidades si fueron provistas
    if (dto.capabilities && dto.capabilities.length > 0) {
      await this.assignCapabilities(savedRole.id, dto.capabilities);
    }

    return this.getRoleById(savedRole.id);
  }

  /**
   * Asigna capacidades (capabilities) a un rol
   */
  async assignCapabilities(
    roleId: number,
    capabilities: AssignCapabilityDto[]
  ): Promise<RoleCapability[]> {
    const role = await this.getRoleById(roleId);

    if (role.isSystemRole) {
      throw new Error('No se pueden modificar roles del sistema');
    }

    const roleCapabilities = capabilities.map(cap => {
      return this.capabilityRepository.create({
        roleId,
        module: cap.module,
        action: cap.action,
        allowed: cap.allowed !== undefined ? cap.allowed : true
      });
    });

    return await this.capabilityRepository.save(roleCapabilities);
  }

  /**
   * Reemplaza todas las capacidades de un rol
   */
  async replaceCapabilities(
    roleId: number,
    capabilities: AssignCapabilityDto[]
  ): Promise<RoleCapability[]> {
    const role = await this.getRoleById(roleId);

    if (role.isSystemRole) {
      throw new Error('No se pueden modificar roles del sistema');
    }

    // Eliminar capabilities existentes
    await this.capabilityRepository.delete({ roleId });

    // Crear nuevas capabilities
    return await this.assignCapabilities(roleId, capabilities);
  }

  /**
   * Establece jerarquía entre roles (padre puede gestionar hijo)
   */
  async setHierarchy(
    parentRoleId: number,
    dto: SetHierarchyDto
  ): Promise<RoleHierarchy> {
    const parentRole = await this.getRoleById(parentRoleId);
    if (!parentRole.canDelegatePermissions) {
      throw new Error('El rol padre no tiene permisos de delegación');
    }

    // Verificar que no exista ya esta jerarquía
    const existing = await this.hierarchyRepository.findOne({
      where: {
        parentRoleId,
        childRoleId: dto.childRoleId
      }
    });

    if (existing) {
      throw new Error('Esta jerarquía ya existe');
    }

    const hierarchy = this.hierarchyRepository.create({
      parentRoleId,
      childRoleId: dto.childRoleId,
      moduleScope: dto.moduleScope || null
    });

    return await this.hierarchyRepository.save(hierarchy);
  }

  /**
   * Obtiene los roles subordinados de un rol padre
   */
  async getSubordinateRoles(parentRoleId: number): Promise<Role[]> {
    const hierarchies = await this.hierarchyRepository.find({
      where: { parentRoleId },
      relations: ['childRole', 'childRole.roleCapabilities']
    });

    return hierarchies.map(h => h.childRole);
  }

  /**
   * Verifica si un rol tiene una capacidad específica
   */
  async hasCapability(
    roleId: number,
    module: string,
    action: string
  ): Promise<boolean> {
    const capability = await this.capabilityRepository.findOne({
      where: { roleId, module, action }
    });

    return capability ? capability.allowed : false;
  }

  /**
   * Obtiene todas las capacidades de un rol
   */
  async getRoleCapabilities(roleId: number): Promise<RoleCapability[]> {
    return await this.capabilityRepository.find({
      where: { roleId },
      order: { module: 'ASC', action: 'ASC' }
    });
  }

  /**
   * Obtiene un rol por ID con todas sus relaciones
   */
  async getRoleById(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['roleCapabilities', 'rolePermissions', 'rolePermissions.permission']
    });

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return role;
  }

  /**
   * Actualiza un rol dinámico
   */
  async updateDynamicRole(
    roleId: number,
    dto: UpdateDynamicRoleDto
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);

    if (role.isSystemRole) {
      throw new Error('No se pueden modificar roles del sistema');
    }

    if (dto.name && dto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: dto.name }
      });

      if (existingRole && existingRole.id !== roleId) {
        throw new Error('Ya existe un rol con ese nombre');
      }
    }

    // Actualizar campos
    if (dto.name) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description || null;
    if (dto.isActive !== undefined) role.isActive = dto.isActive;
    if (dto.moduleScopes !== undefined) role.moduleScopes = dto.moduleScopes;
    if (dto.canDelegatePermissions !== undefined) role.canDelegatePermissions = dto.canDelegatePermissions;

    await this.roleRepository.save(role);

    return this.getRoleById(roleId);
  }

  /**
   * Elimina un rol dinámico
   */
  async deleteDynamicRole(roleId: number): Promise<void> {
    const role = await this.getRoleById(roleId);

    if (role.isSystemRole) {
      throw new Error('No se pueden eliminar roles del sistema');
    }

    // Verificar que no tenga usuarios asignados
    const usersCount = await AppDataSource.getRepository(User).count({
      where: { roleId }
    });

    if (usersCount > 0) {
      throw new Error('No se puede eliminar un rol con usuarios asignados');
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Obtiene todos los roles dinámicos (no del sistema)
   */
  async getAllDynamicRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isSystemRole: false },
      relations: ['roleCapabilities'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Elimina una jerarquía entre roles
   */
  async removeHierarchy(
    parentRoleId: number,
    childRoleId: number
  ): Promise<void> {
    await this.hierarchyRepository.delete({
      parentRoleId,
      childRoleId
    });
  }
}
