import { AppDataSource } from '../../../config/database';
import { Permission } from '../entities/Permission.entity';
import { CapabilitiesDiscoveryService } from './CapabilitiesDiscoveryService';

export interface CreatePermissionDto {
  code: string;
  name: string;
  description?: string;
  category: string;
  resource?: string;
  action?: string;
}

/**
 * Servicio para gestionar permisos
 */
export class PermissionsService {
  private get permissionRepository() {
    return AppDataSource.getRepository(Permission);
  }

  /**
   * Obtiene todos los permisos
   * @returns Lista de permisos
   */
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  /**
   * Obtiene un permiso por su ID
   * @param id - ID del permiso
   * @returns Permiso encontrado
   */
  async getPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    });

    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    return permission;
  }

  /**
   * Obtiene un permiso por su código
   * @param code - Código del permiso
   * @returns Permiso encontrado
   */
  async getPermissionByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code }
    });
  }

  /**
   * Crea un nuevo permiso
   * @param createPermissionDto - Datos del permiso a crear
   * @returns Permiso creado
   */
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { code, name, description, category, resource, action } = createPermissionDto;

    const existingPermission = await this.getPermissionByCode(code);

    if (existingPermission) {
      throw new Error('Ya existe un permiso con ese código');
    }

    const permission = this.permissionRepository.create({
      code,
      name,
      description: description || null,
      category,
      resource: resource || null,
      action: action || null
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * Sincroniza permisos desde las capacidades descubiertas
   * Crea permisos que no existen y mantiene los existentes
   * @returns Lista de permisos sincronizados
   */
  async syncPermissionsFromCapabilities(): Promise<Permission[]> {
    const discoveryService = new CapabilitiesDiscoveryService();
    const capabilities = await discoveryService.discoverCapabilities();

    const syncedPermissions: Permission[] = [];

    for (const capability of capabilities) {
      let permission = await this.getPermissionByCode(capability.code);

      if (!permission) {
        permission = await this.createPermission({
          code: capability.code,
          name: capability.name,
          description: capability.description,
          category: capability.category,
          resource: capability.resource || undefined,
          action: capability.action || undefined
        });
      } else {
        // Actualizar información si cambió
        permission.name = capability.name;
        permission.description = capability.description;
        permission.category = capability.category;
        permission.resource = capability.resource;
        permission.action = capability.action;
        permission = await this.permissionRepository.save(permission);
      }

      syncedPermissions.push(permission);
    }

    return syncedPermissions;
  }

  /**
   * Obtiene las capacidades disponibles del sistema
   * @returns Lista de capacidades disponibles
   */
  async getAvailableCapabilities(): Promise<Array<{
    code: string;
    name: string;
    description: string;
    category: string;
    resource: string | null;
    action: string | null;
  }>> {
    const discoveryService = new CapabilitiesDiscoveryService();
    return discoveryService.discoverCapabilities();
  }
}

