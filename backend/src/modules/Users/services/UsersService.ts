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
   * @returns Usuario encontrado sin contraseña
   */
  async getUserById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role']
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
}

