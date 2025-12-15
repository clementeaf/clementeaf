import { AppDataSource } from '../../../config/database';
import { User } from '../entities/User.entity';
import { Role } from '../../Roles/entities/Role.entity';

/**
 * Respuesta paginada de usuarios
 */
export interface PaginatedUsersResponse {
  data: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar usuarios
 */
export class UsersService {
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Obtiene o crea un usuario por su email (útil para usuarios que existen en Cognito pero no en la BD).
   * @param email - Email del usuario
   * @param includePermissions - Si debe incluir permisos del rol
   * @param name - Nombre opcional del usuario
   * @returns Usuario sin contraseña
   */
  async getOrCreateUserByEmail(
    email: string,
    includePermissions: boolean = false,
    name: string | null = null
  ): Promise<Omit<User, 'password'>> {
    const relations = includePermissions
      ? ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
      : ['role'];

    const existing = await this.userRepository.findOne({
      where: { email },
      relations
    });

    if (existing) {
      const { password, ...userWithoutPassword } = existing;
      return userWithoutPassword;
    }

    const created = this.userRepository.create({
      email,
      password: '',
      name,
      roleId: null
    });

    await this.userRepository.save(created);

    const { password, ...userWithoutPassword } = created;
    return userWithoutPassword;
  }

  /**
   * Obtiene todos los usuarios con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de usuarios paginada sin contraseñas
   */
  async getAllUsers(page: number = 1, limit: number = 100): Promise<PaginatedUsersResponse> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      relations: ['role'],
      order: {
        createdAt: 'DESC'
      }
    });

    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario
   * @param includePermissions - Si debe incluir los permisos del rol
   * @returns Usuario encontrado sin contraseña
   */
  async getUserById(id: number, includePermissions: boolean = false): Promise<Omit<User, 'password'>> {
    const relations = includePermissions 
      ? ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
      : ['role'];
    
    const user = await this.userRepository.findOne({
      where: { id },
      relations
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Obtiene un usuario por su email
   * @param email - Email del usuario
   * @param includePermissions - Si debe incluir los permisos del rol
   * @returns Usuario encontrado sin contraseña
   */
  async getUserByEmail(email: string, includePermissions: boolean = false): Promise<Omit<User, 'password'>> {
    const relations = includePermissions 
      ? ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
      : ['role'];
    
    const user = await this.userRepository.findOne({
      where: { email },
      relations
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Actualiza el rol de un usuario
   * @param id - ID del usuario
   * @param roleId - ID del rol a asignar (null para quitar el rol)
   * @returns Usuario actualizado sin contraseña
   */
  async updateUserRole(id: number, roleId: number | null): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (roleId !== null) {
      const roleRepository = AppDataSource.getRepository(Role);
      const role = await roleRepository.findOne({ where: { id: roleId } });
      
      if (!role) {
        throw new Error('Rol no encontrado');
      }
    }

    user.roleId = roleId;
    await this.userRepository.save(user);

    return this.getUserById(id);
  }

  /**
   * Obtiene usuarios que tienen un permiso específico
   * @param permissionCode - Código del permiso
   * @returns Lista de usuarios con el permiso
   */
  async getUsersWithPermission(permissionCode: string): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
    });

    const usersWithPermission = users.filter(user => {
      if (!user.role || !user.role.rolePermissions) return false;
      
      return user.role.rolePermissions.some(rp => 
        rp.permission?.code === permissionCode
      );
    });

    return usersWithPermission.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

