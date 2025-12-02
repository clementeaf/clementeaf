import { useLocation } from 'react-router-dom';
import { routes } from '../../routes';

/**
 * Props del componente PickingSidebar
 */
interface PickingSidebarProps {
  /**
   * Tab activo
   */
  activeTab: string;
  /**
   * Función para cambiar el tab activo
   */
  onTabChange: (tabId: string) => void;
}

/**
 * Componente Sidebar para la página de Picking
 * @param props - Props del componente PickingSidebar
 * @returns Componente PickingSidebar
 */
export const PickingSidebar = ({ activeTab, onTabChange }: PickingSidebarProps): React.ReactElement => {
  const location = useLocation();
  
  const tabs = [
    { id: 'order', label: 'Orden de picking', path: routes.pickingOrder },
    { id: 'history', label: 'Historial', path: routes.pickingHistory },
    { id: 'reports', label: 'Reportes', path: routes.pickingReports }
  ];

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
      {/* Título */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Picking
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestión de picking
        </p>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Navegación de submódulos */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Módulos</h3>
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#0052C9] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

