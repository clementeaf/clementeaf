import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/usersService';

/**
 * Hook para obtener todos los usuarios con paginación
 * @param page - Número de página
 * @param limit - Límite de resultados por página
 * @param options - Opciones adicionales de la query
 */
export const useAllUsers = (
  page: number = 1, 
  limit: number = 50, 
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersService.getAllUsers(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    enabled: options?.enabled !== false
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

