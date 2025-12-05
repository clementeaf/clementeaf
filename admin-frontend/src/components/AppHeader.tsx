import { useNavigate } from 'react-router-dom';
import { NotificationsDropdown } from './Notifications';
import { ProfileIcon } from './commons/icons';
import { useNotifications } from '../hooks/useNotifications';
import { routes } from '../routes';
import type { Notification } from '../types/notifications';

/**
 * Componente de header global de la aplicación
 * @returns Componente AppHeader
 */
export const AppHeader = (): React.ReactElement => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  /**
   * Maneja el click en una notificación
   */
  const handleNotificationClick = (notification: Notification): void => {
    if (notification.type === 'picking') {
      navigate(routes.pickingOrder);
    } else if (notification.type === 'sales') {
      navigate(routes.quotes);
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end gap-4 flex-shrink-0">
      <NotificationsDropdown
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
      <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <ProfileIcon color="#9CA3AF" />
        </div>
        <span className="absolute bottom-[5px] right-[5px] w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
      </button>
    </div>
  );
};

