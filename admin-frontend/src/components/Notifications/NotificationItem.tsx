import type { Notification } from '../../types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

/**
 * Componente de item de notificación
 * @param props - Props del componente NotificationItem
 * @returns Componente NotificationItem
 */
export const NotificationItem = ({ notification, onClick }: NotificationItemProps): React.ReactElement => {
  /**
   * Formatea la fecha relativa (ej: "hace 5 minutos")
   */
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'hace unos segundos';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }

    // Si es más de una semana, mostrar fecha completa
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Obtiene el color del icono según el tipo de notificación
   */
  const getIconColor = (): string => {
    switch (notification.type) {
      case 'picking':
        return 'bg-blue-100 text-blue-600';
      case 'sales':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  /**
   * Obtiene el icono según el tipo de notificación
   */
  const getIcon = (): React.ReactElement => {
    switch (notification.type) {
      case 'picking':
        return (
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 2L11 4H16C16.55 4 17 4.45 17 5V15C17 15.55 16.55 16 16 16H4C3.45 16 3 15.55 3 15V5C3 4.45 3.45 4 4 4H7L9 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'sales':
        return (
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 2L12 4H16C16.55 4 17 4.45 17 5V15C17 15.55 16.55 16 16 16H4C3.45 16 3 15.55 3 15V5C3 4.45 3.45 4 4 4H8L10 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 10L12 12L10 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
        notification.status === 'unread' ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor()}`}>
          {getIcon()}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{notification.message}</p>
            </div>
            {notification.status === 'unread' && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">{formatRelativeTime(notification.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

