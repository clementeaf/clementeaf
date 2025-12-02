import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PageHeader } from '../components/commons';
import { PickingSidebar } from './Picking/PickingSidebar';
import { routes } from '../routes';
import {
  OrderSection,
  HistorySection,
  ReportsSection
} from './Picking/sections';

/**
 * Página de Picking
 * @returns Componente Picking
 */
export const Picking = (): React.ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Determina el tab activo según la ruta actual
   */
  const getActiveTab = (): string => {
    if (location.pathname === routes.pickingOrder || location.pathname.startsWith(routes.pickingOrder)) {
      return 'order';
    }
    if (location.pathname === routes.pickingHistory || location.pathname.startsWith(routes.pickingHistory)) {
      return 'history';
    }
    if (location.pathname === routes.pickingReports || location.pathname.startsWith(routes.pickingReports)) {
      return 'reports';
    }
    // Por defecto, redirigir a orden de picking
    return 'order';
  };

  const activeTab = getActiveTab();

  /**
   * Redirige a la ruta por defecto si está en /picking
   */
  useEffect(() => {
    if (location.pathname === routes.picking) {
      navigate(routes.pickingOrder, { replace: true });
    }
  }, [location.pathname, navigate]);

  /**
   * Maneja el cambio de tab navegando a la ruta correspondiente
   */
  const handleTabChange = (tabId: string): void => {
    switch (tabId) {
      case 'order':
        navigate(routes.pickingOrder);
        break;
      case 'history':
        navigate(routes.pickingHistory);
        break;
      case 'reports':
        navigate(routes.pickingReports);
        break;
      default:
        navigate(routes.pickingOrder);
    }
  };

  /**
   * Renderiza el contenido según el tab activo
   */
  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'order':
        return <OrderSection />;
      case 'history':
        return <HistorySection />;
      case 'reports':
        return <ReportsSection />;
      default:
        return <OrderSection />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8">
      <PageHeader title="Picking" />

      <div className="flex gap-6 flex-1 min-h-0">
        <PickingSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

