import { useNavigate } from 'react-router-dom';
import { BellIcon, ProfileIcon } from '../../../components/commons/icons';
import { Button } from '../../../components/commons';
import { routes } from '../../../routes';
import ArrowRightIcon from '../../../assets/right.png';

/**
 * Componente Header de la página crear cliente
 * @returns Componente CreateClientHeader
 */
export const CreateClientHeader = () => {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Crear cliente</h1>
          <nav className="text-sm text-gray-600 flex items-center gap-2">
            <button onClick={handleBackToClients} className='hover:text-black'>Clientes</button>
            <img src={ArrowRightIcon} alt="Arrow right" className="w-4 h-4" />
            <span className="text-gray-800 font-medium">Crear cliente</span>
          </nav>
        </div>
      </div>
    
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <BellIcon color="#6B7280" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
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

