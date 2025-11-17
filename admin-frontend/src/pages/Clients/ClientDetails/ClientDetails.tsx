import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientById } from '../../../hooks/useClients';
import { routes } from '../../../routes';
import { Tabs, type TabItem, ChevronRightIcon } from '../../../components/commons';
import { ClientSidebar } from './ClientSidebar';
import {
  ClientInfoSection,
  SegmentationSection,
  BillingSection,
  ContactSection,
  AddressSection,
  BranchesSection
} from './sections';

/**
 * Página de detalles del cliente (Ficha cliente)
 * @returns Componente ClientDetails
 */
export const ClientDetails = (): React.ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = id ? parseInt(id, 10) : null;

  const { data: client, isLoading, error } = useClientById(clientId);

  // Estado para tabs principales
  const [mainTab, setMainTab] = useState<string>('info');
  
  // Estado para sub-tabs de información
  const [infoTab, setInfoTab] = useState<string>('all');

  /**
   * Maneja el click en el botón de volver
   */
  const handleBack = useCallback((): void => {
    navigate(routes.clients);
  }, [navigate]);

  /**
   * Maneja la creación de cotización
   */
  const handleCreateQuote = useCallback((): void => {
    // TODO: Implementar navegación a creación de cotización
    console.log('Crear cotización para cliente:', clientId);
  }, [clientId]);

  /**
   * Maneja la adición de sucursal
   */
  const handleAddBranch = useCallback((): void => {
    // TODO: Implementar modal/formulario para añadir sucursal
    console.log('Añadir sucursal para cliente:', clientId);
  }, [clientId]);

  // Sub-tabs de información - se recrean cuando cambia el cliente
  // IMPORTANTE: Todos los hooks deben estar antes de cualquier return condicional
  const infoTabs = useMemo((): TabItem[] => {
    if (!client) return [];
    
    return [
    {
      id: 'all',
      label: 'Ver todo',
      content: (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <SegmentationSection client={client} />
          </div>
          <div className="flex-1 overflow-hidden">
            <BillingSection client={client} />
          </div>
        </div>
      )
    },
    {
      id: 'segmentation',
      label: 'Segmentación',
      content: <SegmentationSection client={client} />
    },
    {
      id: 'billing',
      label: 'Facturación',
      content: <BillingSection client={client} />
    },
    {
      id: 'contact',
      label: 'Contacto',
      content: <ContactSection client={client} />
    },
    {
      id: 'address',
      label: 'Dirección',
      content: <AddressSection client={client} />
    },
    {
      id: 'branches',
      label: 'Sucursales',
      content: <BranchesSection clientId={client.id} />
    }
    ];
  }, [client]);

  // Tabs principales
  const mainTabs = useMemo((): TabItem[] => {
    if (!client) return [];
    
    return [
    {
      id: 'info',
      label: 'Información del cliente',
      content: (
        <div>
          {/* Sub-tabs de información */}
          <Tabs
            tabs={infoTabs}
            activeTab={infoTab}
            onTabChange={setInfoTab}
            containerClassName="mb-6"
          />
        </div>
      )
    },
    {
      id: 'quotes',
      label: 'Cotizaciones',
      content: (
        <div className="text-center py-12 text-gray-500">
          <p>No hay cotizaciones registradas</p>
          <button
            onClick={handleCreateQuote}
            className="mt-4 text-[#004BB7] hover:text-[#003a94] text-sm font-medium"
          >
            Crear cotización
          </button>
        </div>
      )
    },
    {
      id: 'history',
      label: 'Historial de compras',
      content: (
        <div className="text-center py-12 text-gray-500">
          <p>No hay historial de compras</p>
        </div>
      )
    }
    ];
  }, [infoTabs, infoTab, handleCreateQuote, client]);

  // Renderizar estados de carga/error DESPUÉS de todos los hooks
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-gray-500">Cargando detalles del cliente...</div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const isNotFound = errorMessage.includes('no encontrado') || errorMessage.includes('not found');
    
    return (
      <div className="w-full h-full flex items-center justify-center flex-col gap-4">
        <div className={`text-lg ${isNotFound ? 'text-gray-500' : 'text-red-500'}`}>
          {isNotFound ? 'Cliente no encontrado' : 'Error al cargar los detalles del cliente'}
        </div>
        {!isNotFound && (
          <button
            onClick={handleBack}
            className="text-[#004BB7] hover:text-[#003a94] font-medium"
          >
            ← Volver a Clientes
          </button>
        )}
      </div>
    );
  }

  if (!client) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col gap-4">
        <div className="text-lg text-gray-500">Cliente no encontrado</div>
        <button
          onClick={handleBack}
          className="text-[#004BB7] hover:text-[#003a94] font-medium"
        >
          ← Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={handleBack}
            className="hover:text-gray-900 transition-colors"
          >
            Clientes
          </button>
          <ChevronRightIcon color="#9CA3AF" />
          <span className="text-gray-900 font-medium">Ficha cliente</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex gap-6 p-6 min-h-0 overflow-hidden">
        {/* Sidebar izquierdo */}
        <div className="flex-shrink-0 h-full">
          <ClientSidebar
            client={client}
            onCreateQuote={handleCreateQuote}
            onAddBranch={handleAddBranch}
          />
        </div>

        {/* Área principal con tabs */}
        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden h-full">
          <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Tabs
              tabs={mainTabs}
              activeTab={mainTab}
              onTabChange={setMainTab}
              containerClassName="h-full flex flex-col"
              tabsListClassName="mb-6 flex-shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

