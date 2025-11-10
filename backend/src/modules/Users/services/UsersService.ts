import { AppDataSource } from '../../../config/database';
import { User } from '../entities/User.entity';

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
      where: { id }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

