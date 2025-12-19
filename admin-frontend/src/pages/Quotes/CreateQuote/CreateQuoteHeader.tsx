import { useNavigate } from 'react-router-dom';
import { ProfileIcon } from '../../../components/commons/icons';
import { NotificationsDropdown } from '../../../components/Notifications';
import { useNotifications } from '../../../hooks/useNotifications';
import { routes } from '../../../routes';
import type { Notification } from '../../../types/notifications';
import ArrowRightIcon from '../../../assets/right.png';

/**
 * Componente Header de la página crear orden de compra
 * @returns Componente CreateQuoteHeader
 */
export const CreateQuoteHeader = () => {
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

  /**
   * Maneja la navegación de vuelta a la tabla de clientes
   */
  const handleBackToClients = (): void => {
    navigate(routes.clients);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-2xl font-bold text-gray-800">Crear Nota de venta</h1>
            <button
              onClick={handleBackToClients}
              className="py-2 text-gray-700 text-sm"
            >
              Volver a Clientes
            </button>
          </div>
          <nav className="text-sm text-gray-600 flex items-center gap-2">
            <button onClick={handleBackToClients} className='hover:text-black'>Clientes</button>
            <img src={ArrowRightIcon} alt="Arrow right" className="w-4 h-4" />
            <span className="text-gray-800 font-medium">Crear Nota de venta</span>
          </nav>
        </div>
      </div>
    
      <div className="flex items-center gap-4">
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
    </div>
  );
};

