import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesService, type CreateBranchDto, type UpdateBranchDto } from '../services/branchesService';

/**
 * Hook para obtener sucursales de un cliente
 * @param clientId - ID del cliente
 * @param includeInactive - Incluir sucursales inactivas
 * @returns Query con sucursales
 */
export const useBranches = (clientId: number | null, includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ['branches', clientId, includeInactive],
    queryFn: async () => {
      if (!clientId) {
        return { data: [] };
      }
      return await branchesService.getBranchesByClientId(clientId, includeInactive);
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10 // 10 minutos
  });
};

/**
 * Hook para crear una sucursal
 * @returns Mutation para crear sucursal
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, dto }: { clientId: number; dto: CreateBranchDto }) => {
      return await branchesService.createBranch(clientId, dto);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches', variables.clientId] });
    }
  });
};

/**
 * Hook para actualizar una sucursal
 * @returns Mutation para actualizar sucursal
 */
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, branchId, dto }: { clientId: number; branchId: number; dto: UpdateBranchDto }) => {
      return await branchesService.updateBranch(clientId, branchId, dto);
    },
    onSuccess: (branch) => {
      queryClient.invalidateQueries({ queryKey: ['branches', branch.clientId] });
    }
  });
};

/**
 * Hook para eliminar una sucursal
 * @returns Mutation para eliminar sucursal
 */
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, branchId }: { clientId: number; branchId: number }) => {
      await branchesService.deleteBranch(clientId, branchId);
      return { clientId, branchId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches', variables.clientId] });
    }
  });
};

