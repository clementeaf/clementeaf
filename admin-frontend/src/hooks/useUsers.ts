import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/usersService';

/**
 * Hook para obtener todos los usuarios con paginación
 * @param page - Número de página
 * @param limit - Límite de resultados por página
 */
export const useAllUsers = (page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersService.getAllUsers(page, limit),
    staleTime: 1000 * 60 * 5
  });
};

/**
 * Hook para obtener un usuario por su ID
 * @param id - ID del usuario
 */
export const useUserById = (id: number | null) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => {
      if (!id) throw new Error('User ID is required');
      return usersService.getUserById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
};

