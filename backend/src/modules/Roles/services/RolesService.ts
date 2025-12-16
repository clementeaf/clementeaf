import { AppDataSource } from '../../../config/database';
import { In } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { RolePermission } from '../entities/RolePermission.entity';
import { RoleCapability } from '../entities/RoleCapability.entity';
import { RoleHierarchy } from '../entities/RoleHierarchy.entity';
import { User } from '../../Users/entities/User.entity';

export interface CapabilityDto {
  module: string;
  action: string;
  allowed?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: number[];
  moduleScopes?: string[];
  canDelegatePermissions?: boolean;
  capabilities?: CapabilityDto[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
  moduleScopes?: string[];
  canDelegatePermissions?: boolean;
  capabilities?: CapabilityDto[];
}

/**
 * Servicio para gestionar roles
 */
export class RolesService {
  private get roleRepository() {
    return AppDataSource.getRepository(Role);
  }

  private get permissionRepository() {
    return AppDataSource.getRepository(Permission);
  }

  private get rolePermissionRepository() {
    return AppDataSource.getRepository(RolePermission);
  }

  private get roleCapabilityRepository() {
    return AppDataSource.getRepository(RoleCapability);
  }

  private get roleHierarchyRepository() {
    return AppDataSource.getRepository(RoleHierarchy);
  }

  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Crea un nuevo rol
   * @param createRoleDto - Datos del rol a crear
   * @returns Rol creado
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds, moduleScopes, canDelegatePermissions, capabilities } = createRoleDto;

    const existingRole = await this.roleRepository.findOne({
      where: { name }
    });

    if (existingRole) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    const role = this.roleRepository.create({
      name,
      description: description || null,
      isActive: true,
      moduleScopes: moduleScopes || null,
      canDelegatePermissions: canDelegatePermissions || false
    });

    const savedRole = await this.roleRepository.save(role);

    // Asignar permisos tradicionales
    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissionsToRole(savedRole.id, permissionIds);
    }

    // Asignar capabilities si existen
    if (capabilities && capabilities.length > 0) {
      await this.assignCapabilities(savedRole.id, capabilities);
    }

    return this.getRoleById(savedRole.id);
  }

  /**
   * Obtiene todos los roles
   * @returns Lista de roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['rolePermissions', 'rolePermissions.permission', 'roleCapabilities'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene un rol por su ID
   * @param id - ID del rol
   * @returns Rol encontrado
   */
  async getRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission', 'roleCapabilities']
    });

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return role;
  }

  /**
   * Actualiza un rol
   * @param id - ID del rol
   * @param updateRoleDto - Datos a actualizar
   * @returns Rol actualizado
   */
  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.getRoleById(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name }
      });

      if (existingRole && existingRole.id !== id) {
        throw new Error('Ya existe un rol con ese nombre');
      }
    }

    if (updateRoleDto.name) {
      role.name = updateRoleDto.name;
    }
    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description || null;
    }
    if (updateRoleDto.isActive !== undefined) {
      role.isActive = updateRoleDto.isActive;
    }
    if (updateRoleDto.moduleScopes !== undefined) {
      role.moduleScopes = updateRoleDto.moduleScopes || null;
    }
    if (updateRoleDto.canDelegatePermissions !== undefined) {
      role.canDelegatePermissions = updateRoleDto.canDelegatePermissions;
    }

    await this.roleRepository.save(role);

    if (updateRoleDto.permissionIds !== undefined) {
      await this.rolePermissionRepository.delete({ roleId: id });
      if (updateRoleDto.permissionIds.length > 0) {
        await this.assignPermissionsToRole(id, updateRoleDto.permissionIds);
      }
    }

    // Actualizar capabilities si se proporcionan
    if (updateRoleDto.capabilities !== undefined) {
      await this.roleCapabilityRepository.delete({ roleId: id });
      if (updateRoleDto.capabilities.length > 0) {
        await this.assignCapabilities(id, updateRoleDto.capabilities);
      }
    }

    return this.getRoleById(id);
  }

  /**
   * Elimina un rol
   * @param id - ID del rol
   */
  async deleteRole(id: number): Promise<void> {
    const role = await this.getRoleById(id);

    // Verificar que no tenga usuarios asignados
    const usersCount = await this.userRepository.count({
      where: { roleId: id }
    });

    if (usersCount > 0) {
      throw new Error('No se puede eliminar un rol con usuarios asignados');
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Asigna permisos a un rol
   * @param roleId - ID del rol
   * @param permissionIds - IDs de los permisos
   */
  private async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<void> {
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) }
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('Uno o más permisos no fueron encontrados');
    }

    const rolePermissions = permissions.map(permission => {
      return this.rolePermissionRepository.create({
        roleId,
        permissionId: permission.id
      });
    });

    await this.rolePermissionRepository.save(rolePermissions);
  }

  /**
   * Asigna capabilities a un rol
   * @param roleId - ID del rol
   * @param capabilities - Lista de capabilities
   */
  async assignCapabilities(roleId: number, capabilities: CapabilityDto[]): Promise<RoleCapability[]> {
    const role = await this.getRoleById(roleId);

    // Validar que las capabilities estén dentro de los moduleScopes si existen
    if (role.moduleScopes && role.moduleScopes.length > 0) {
      const invalidCapabilities = capabilities.filter(
        cap => !role.moduleScopes!.includes(cap.module)
      );
      
      if (invalidCapabilities.length > 0) {
        throw new Error(
          `Las siguientes capabilities no están en los moduleScopes del rol: ${invalidCapabilities.map(c => c.module).join(', ')}`
        );
      }
    }

    const roleCapabilities = capabilities.map(cap => {
      return this.roleCapabilityRepository.create({
        roleId,
        module: cap.module,
        action: cap.action,
        allowed: cap.allowed !== undefined ? cap.allowed : true
      });
    });

    return await this.roleCapabilityRepository.save(roleCapabilities);
  }

  /**
   * Obtiene las capabilities de un rol
   * @param roleId - ID del rol
   */
  async getRoleCapabilities(roleId: number): Promise<RoleCapability[]> {
    return await this.roleCapabilityRepository.find({
      where: { roleId },
      order: { module: 'ASC', action: 'ASC' }
    });
  }

  /**
   * Establece jerarquía entre roles
   * @param parentRoleId - ID del rol padre
   * @param childRoleId - ID del rol hijo
   * @param moduleScope - Ámbito de delegación opcional
   */
  async setRoleHierarchy(
    parentRoleId: number,
    childRoleId: number,
    moduleScope?: string
  ): Promise<RoleHierarchy> {
    const parentRole = await this.getRoleById(parentRoleId);
    await this.getRoleById(childRoleId); // Verificar que existe

    if (!parentRole.canDelegatePermissions) {
      throw new Error('El rol padre no tiene permisos de delegación');
    }

    // Prevenir ciclos
    if (parentRoleId === childRoleId) {
      throw new Error('Un rol no puede ser padre de sí mismo');
    }

    // Verificar que no exista ya esta jerarquía
    const existing = await this.roleHierarchyRepository.findOne({
      where: {
        parentRoleId,
        childRoleId
      }
    });

    if (existing) {
      throw new Error('Esta jerarquía ya existe');
    }

    const hierarchy = this.roleHierarchyRepository.create({
      parentRoleId,
      childRoleId,
      moduleScope: moduleScope || null
    });

    return await this.roleHierarchyRepository.save(hierarchy);
  }

  /**
   * Obtiene los roles subordinados de un rol padre
   * @param parentRoleId - ID del rol padre
   */
  async getSubordinateRoles(parentRoleId: number): Promise<Role[]> {
    const hierarchies = await this.roleHierarchyRepository.find({
      where: { parentRoleId },
      relations: ['childRole', 'childRole.roleCapabilities', 'childRole.rolePermissions', 'childRole.rolePermissions.permission']
    });

    return hierarchies.map(h => h.childRole);
  }

  /**
   * Verifica si un rol puede gestionar otro rol
   * @param managerRoleId - ID del rol gestor
   * @param targetRoleId - ID del rol objetivo
   */
  async canManageRole(managerRoleId: number, targetRoleId: number): Promise<boolean> {
    const managerRole = await this.getRoleById(managerRoleId);
    
    if (!managerRole.canDelegatePermissions) {
      return false;
    }

    // Verificar si existe jerarquía directa
    const hierarchy = await this.roleHierarchyRepository.findOne({
      where: {
        parentRoleId: managerRoleId,
        childRoleId: targetRoleId
      }
    });

    return !!hierarchy;
  }

  /**
   * Elimina una jerarquía entre roles
   * @param parentRoleId - ID del rol padre
   * @param childRoleId - ID del rol hijo
   */
  async removeRoleHierarchy(parentRoleId: number, childRoleId: number): Promise<void> {
    await this.roleHierarchyRepository.delete({
      parentRoleId,
      childRoleId
    });
  }
}

