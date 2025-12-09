import { useMemo } from 'react';
import { useWebSocketEvents, type WebSocketEventConfig } from './useWebSocketEvents';

interface UseBranchesWebSocketOptions {
  clientId?: number;
  onBranchCreated?: () => void;
  onBranchUpdated?: () => void;
  onBranchDeleted?: (branchId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de sucursales vía WebSocket
 * @param options - Opciones de configuración
 * @returns Función para desconectar manualmente
 */
export const useBranchesWebSocket = (options: UseBranchesWebSocketOptions = {}) => {
  const { clientId, onBranchCreated, onBranchUpdated, onBranchDeleted, onError } = options;

  const events: WebSocketEventConfig[] = useMemo(() => {
    const baseQueryKeys = clientId ? [['branches', clientId]] : [['branches']];

    return [
      {
        action: 'branch_created',
        queryKeys: baseQueryKeys,
        filter: clientId 
          ? (data: unknown) => {
              if (typeof data === 'object' && data !== null && 'clientId' in data) {
                const dataClientId = (data as { clientId: unknown }).clientId;
                return String(dataClientId) === String(clientId);
              }
              return true;
            }
          : undefined,
        onEvent: onBranchCreated ? () => onBranchCreated() : undefined
      },
      {
        action: 'branch_updated',
        queryKeys: baseQueryKeys,
        queryKeysWithId: (id: string) => [['branch', id]],
        filter: clientId 
          ? (data: unknown) => {
              if (typeof data === 'object' && data !== null && 'clientId' in data) {
                const dataClientId = (data as { clientId: unknown }).clientId;
                return String(dataClientId) === String(clientId);
              }
              return true;
            }
          : undefined,
        onEvent: onBranchUpdated ? () => onBranchUpdated() : undefined
      },
      {
        action: 'branch_deleted',
        queryKeys: baseQueryKeys,
        filter: clientId 
          ? (data: unknown) => {
              if (typeof data === 'object' && data !== null && 'clientId' in data) {
                const dataClientId = (data as { clientId: unknown }).clientId;
                return String(dataClientId) === String(clientId);
              }
              return true;
            }
          : undefined,
        onEvent: onBranchDeleted 
          ? (data: unknown) => {
              if (typeof data === 'object' && data !== null && 'branchId' in data) {
                const branchId = String((data as { branchId: unknown }).branchId);
                onBranchDeleted(branchId);
              }
            }
          : undefined
      }
    ];
  }, [clientId, onBranchCreated, onBranchUpdated, onBranchDeleted]);

  return useWebSocketEvents({
    events,
    onError,
    logPrefix: 'BRANCHES WS'
  });
};

