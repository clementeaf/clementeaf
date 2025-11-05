import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/commons';
import { PlusIcon, BellIcon, ProfileIcon } from '../../components/commons/icons';
import { routes } from '../../routes';

/**
 * Props del componente ClientsHeader
 */
interface ClientsHeaderProps {
  /**
   * Función para manejar el click en crear cliente (opcional, usa navegación por defecto)
   */
  onCreateClient?: () => void;
}

/**
 * Componente Header de la página de clientes
 * @param props - Props del componente ClientsHeader
 * @returns Componente ClientsHeader
 */
export const ClientsHeader = ({ onCreateClient }: ClientsHeaderProps) => {
  const navigate = useNavigate();

  const handleCreateClient = (): void => {
    if (onCreateClient) {
      onCreateClient();
    } else {
      navigate(routes.createClient);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
      <div className="flex items-center gap-4">
        <Button
          onClick={handleCreateClient}
          leftIcon={<PlusIcon color="white" />}
          className="bg-[#004BB7] text-white hover:bg-blue-600"
        >
          Crear cliente
        </Button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <BellIcon color="#6B7280" />
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

