import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/commons';
import { PickingSidebar, type PickingFilters } from './Picking/PickingSidebar';
import { routes } from '../routes';
import {
  OrderSection,
  MetricsSection,
  WarehouseMapSection
} from './Picking/sections';

/**
 * Página de Bodega
 * @returns Componente Bodega
 */
export const Picking = (): React.ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PickingFilters>({});

  /**
   * Determina el tab activo según la ruta actual
   */
  const getActiveTab = (): string => {
    if (location.pathname === routes.pickingOrder || location.pathname.startsWith(routes.pickingOrder)) {
      return 'order';
    }
    if (location.pathname === routes.pickingMetrics || location.pathname.startsWith(routes.pickingMetrics)) {
      return 'metrics';
    }
    if (location.pathname === routes.pickingWarehouse || location.pathname.startsWith(routes.pickingWarehouse)) {
      return 'warehouse';
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
   * Renderiza el contenido según el tab activo
   */
  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'order':
        return <OrderSection filters={filters} />;
      case 'metrics':
        return <MetricsSection />;
      case 'warehouse':
        return <WarehouseMapSection />;
      default:
        return <OrderSection filters={filters} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8">
      <PageHeader title="Bodega" />

      <div className="flex gap-4 flex-1 min-h-0">
        {activeTab === 'order' && (
          <PickingSidebar
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

