import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * Rol del usuario
 */
export interface UserRole {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

/**
 * Usuario
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  roleId: number | null;
  role: UserRole | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Respuesta paginada de usuarios
 */
export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO para crear un usuario
 */
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  roleId?: number | null;
}

/**
 * Servicio para gestionar usuarios
 */
export const usersService = {
  /**
   * Obtiene todos los usuarios con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de usuarios paginada
   */
  async getAllUsers(page: number = 1, limit: number = 100): Promise<PaginatedUsersResponse> {
    const url = endpoints.users.getAll;
    // Axios maneja automáticamente la concatenación de baseURL + url
    // El log es solo para debugging
    const baseURL = apiClient.defaults.baseURL || '';
    const separator = baseURL.endsWith('/') || url.startsWith('/') ? '' : '/';
    const fullUrl = `${baseURL}${separator}${url}?page=${page}&limit=${limit}`;
    console.log('🔍 getAllUsers - URL completa:', fullUrl);
    const { data } = await apiClient.get<{ data: PaginatedUsersResponse }>(
      url,
      {
        params: { page, limit }
      }
    );
    return data.data;
  },

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario
   * @returns Usuario encontrado
   */
  async getUserById(id: number): Promise<User> {
    const url = endpoints.users.getById.replace('{id}', id.toString());
    const { data } = await apiClient.get<{ data: User }>(url);
    return data.data;
  },

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    // Primero crear el usuario usando el endpoint de registro
    const { data: registerData } = await apiClient.post<{ data: { id: number; email: string; name: string | null; createdAt: string; updatedAt: string }; message: string }>(
      'auth/register',
      {
        email: userData.email,
        password: userData.password,
        name: userData.name
      }
    );

    const createdUser = registerData.data;

    // Si se especificó un rol, asignarlo
    if (userData.roleId !== undefined && userData.roleId !== null) {
      const url = endpoints.users.updateRole.replace('{id}', createdUser.id.toString());
      const { data } = await apiClient.put<{ data: { user: User } }>(url, { roleId: userData.roleId });
      return data.data.user;
    }

    // Si no hay rol, retornar el usuario sin rol
    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      roleId: null,
      role: null,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt
    };
  },

  /**
   * Actualiza el rol de un usuario
   * @param id - ID del usuario
   * @param roleId - ID del rol a asignar (null para quitar el rol)
   * @returns Usuario actualizado
   */
  async updateUserRole(id: number, roleId: number | null): Promise<User> {
    const url = endpoints.users.updateRole.replace('{id}', id.toString());
    const { data } = await apiClient.put<{ data: { user: User } }>(url, { roleId });
    return data.data.user;
  }
};

