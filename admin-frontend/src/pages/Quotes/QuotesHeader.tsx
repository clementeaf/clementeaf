import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/commons';
import { BellIcon, ProfileIcon } from '../../components/commons/icons';
import { routes } from '../../routes';
import addBlueIcon from '../../assets/addBlue.png';

/**
 * Props del componente QuotesHeader
 */
interface QuotesHeaderProps {
  /**
   * Función para manejar el click en crear cotización (opcional, usa navegación por defecto)
   */
  onCreateQuote?: () => void;
}

/**
 * Componente Header de la página de cotizaciones
 * @param props - Props del componente QuotesHeader
 * @returns Componente QuotesHeader
 */
export const QuotesHeader = ({ onCreateQuote }: QuotesHeaderProps) => {
  const navigate = useNavigate();

  const handleCreateQuote = (): void => {
    if (onCreateQuote) {
      onCreateQuote();
    } else {
      navigate(routes.createQuote);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Cotizaciones</h1>
      <div className="flex items-center gap-4">
        <Button
          onClick={handleCreateQuote}
          leftIcon={<img src={addBlueIcon} alt="add blue icon" />}
          className="bg-[#0052C9] text-white hover:bg-[#004BB7]"
        >
          Crear cotización
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

