import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '../commons/icons';
import type { Notification } from '../../types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

/**
 * Componente de dropdown de notificaciones
 * @param props - Props del componente NotificationsDropdown
 * @returns Componente NotificationsDropdown
 */
export const NotificationsDropdown = ({
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsDropdownProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Cierra el dropdown al hacer click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Maneja el click en una notificación
   */
  const handleNotificationClick = (notification: Notification): void => {
    if (notification.status === 'unread' && onMarkAsRead) {
      onMarkAsRead(String(notification.id));
    }
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Notificaciones"
      >
        <BellIcon color="#6B7280" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-[#0052C9] hover:text-[#004BB7] font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellIcon color="#9CA3AF" />
                <p className="text-sm text-gray-500 mt-2">No hay notificaciones</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

