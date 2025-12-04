import { AppDataSource } from '../../../config/database';
import { In } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { RolePermission } from '../entities/RolePermission.entity';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
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

  /**
   * Crea un nuevo rol
   * @param createRoleDto - Datos del rol a crear
   * @returns Rol creado
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;

    const existingRole = await this.roleRepository.findOne({
      where: { name }
    });

    if (existingRole) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    const role = this.roleRepository.create({
      name,
      description: description || null,
      isActive: true
    });

    const savedRole = await this.roleRepository.save(role);

    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissionsToRole(savedRole.id, permissionIds);
    }

    return this.getRoleById(savedRole.id);
  }

  /**
   * Obtiene todos los roles
   * @returns Lista de roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['rolePermissions', 'rolePermissions.permission'],
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
      relations: ['rolePermissions', 'rolePermissions.permission']
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

    await this.roleRepository.save(role);

    if (updateRoleDto.permissionIds !== undefined) {
      await this.rolePermissionRepository.delete({ roleId: id });
      if (updateRoleDto.permissionIds.length > 0) {
        await this.assignPermissionsToRole(id, updateRoleDto.permissionIds);
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
}

