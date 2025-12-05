import { ReactNode } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { usePickingOrdersWebSocket } from '../../hooks/usePickingOrdersWebSocket';
import type { PickingOrder } from '../../pages/Picking/types';

interface NotificationsProviderProps {
  children: ReactNode;
}

/**
 * Provider de notificaciones que escucha eventos WebSocket
 * @param props - Props del provider
 * @returns Provider de notificaciones
 */
export const NotificationsProvider = ({ children }: NotificationsProviderProps): React.ReactElement => {
  const notifications = useNotifications();

  /**
   * Escucha eventos de nuevas órdenes de picking para crear notificaciones
   */
  usePickingOrdersWebSocket({
    onNewOrder: notifications.hasPickingAccess ? (pickingOrder: PickingOrder, quoteInfo?: { clienteNombre?: string; monto?: number; numeroCotizacion?: string; estado?: string }) => {
      notifications.createPickingNotification(pickingOrder, quoteInfo);
    } : undefined,
    onError: (error) => {
      console.error('Error en WebSocket de notificaciones:', error);
    }
  });

  return <>{children}</>;
};

