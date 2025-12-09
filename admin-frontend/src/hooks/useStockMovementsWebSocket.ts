import { useWebSocketEvents, type WebSocketEventConfig } from './useWebSocketEvents';

interface StockMovementsWebSocketMessage {
  action: 'stock_movement_created';
  movementId?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  warehouseId?: number;
  type?: string;
  cantidad?: number;
  stockAnterior?: number;
  stockNuevo?: number;
}

interface UseStockMovementsWebSocketOptions {
  onMovementCreated?: (data: StockMovementsWebSocketMessage) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para escuchar eventos de movimientos de stock vía WebSocket
 * @param options - Opciones de configuración
 * @returns Función para desconectar manualmente
 */
export const useStockMovementsWebSocket = (options: UseStockMovementsWebSocketOptions = {}) => {
  const { onMovementCreated, onError } = options;

  const events: WebSocketEventConfig[] = [
    {
      action: 'stock_movement_created',
      queryKeys: [['products']],
      queryKeysWithId: (id: string) => [['productHistory', id]],
      filter: (data: unknown) => {
        // Solo procesar si tiene productId
        return typeof data === 'object' && data !== null && 'productId' in data;
      },
      onEvent: onMovementCreated 
        ? (data: unknown) => {
            if (typeof data === 'object' && data !== null) {
              onMovementCreated(data as StockMovementsWebSocketMessage);
            }
          }
        : undefined
    }
  ];

  return useWebSocketEvents({
    events,
    onError,
    logPrefix: 'STOCK MOVEMENTS WS'
  });
};

