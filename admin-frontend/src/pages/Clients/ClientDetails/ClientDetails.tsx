import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientById } from '../../../hooks/useClients';
import { routes } from '../../../routes';
import { type TabItem, ChevronRightIcon } from '../../../components/commons';
import { ClientSidebar } from './ClientSidebar';
import {
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

  // Contenido de cada tab principal
  const renderMainTabContent = (): React.ReactNode => {
    if (mainTab === 'info') {
      return (
        <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Tabs secundarios con estilo especial */}
          <div className="mb-6 flex-shrink-0">
            <div className="border border-gray-200 rounded-lg bg-white w-[80%]">
              <div className="flex">
                {infoTabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setInfoTab(tab.id)}
                    className={`
                      flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 relative
                      ${tab.id === infoTab
                        ? 'bg-[#E6EEFA] text-[#0052C9]'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }
                      ${index > 0 && tab.id !== infoTab ? 'border-l border-gray-200' : ''}
                    `}
                  >
                    <p>{tab.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Contenido del tab activo */}
          <div className="flex-1 overflow-hidden min-h-0 px-[120px]">
            {infoTabs.find(tab => tab.id === infoTab)?.content}
          </div>
        </div>
      );
    }

    if (mainTab === 'quotes') {
      return (
        <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="text-center py-12 text-gray-500">
            <p>No hay cotizaciones registradas</p>
            <button
              onClick={handleCreateQuote}
              className="mt-4 text-[#004BB7] hover:text-[#003a94] text-sm font-medium"
            >
              Crear cotización
            </button>
          </div>
        </div>
      );
    }

    if (mainTab === 'history') {
      return (
        <div className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="text-center py-12 text-gray-500">
            <p>No hay historial de compras</p>
          </div>
        </div>
      );
    }

    return null;
  };

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
        <div className="flex-shrink-0 h-full border border-gray-200 rounded-lg shadow-sm">
          <ClientSidebar
            client={client}
            onCreateQuote={handleCreateQuote}
            onAddBranch={handleAddBranch}
          />
        </div>

        {/* Área principal con tabs */}
        <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
          {/* Tabs principales y búsqueda en la misma línea */}
          <div className="flex w-full items-center justify-between border-b border-[#95A1B3] relative">
            {/* Tabs a la izquierda */}
            <div className="flex w-2/4">
              <button
                onClick={() => setMainTab('info')}
                className={`
                    px-4 py-3 text-sm font-medium transition-colors duration-200 relative
                    ${mainTab === 'info'
                    ? 'text-[#004BB7]'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                  `}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Información del cliente</span>
                </div>
                {mainTab === 'info' && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#004BB7] z-10" />
                )}
              </button>
              <button
                onClick={() => setMainTab('quotes')}
                className={`
                    flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative
                    ${mainTab === 'quotes'
                    ? 'text-[#004BB7]'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                  `}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Cotizaciones</span>
                </div>
                {mainTab === 'quotes' && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#004BB7] z-10" />
                )}
              </button>
              <button
                onClick={() => setMainTab('history')}
                className={`
                    flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative
                    ${mainTab === 'history'
                    ? 'text-[#004BB7]'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                  `}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Historial de compras</span>
                </div>
                {mainTab === 'history' && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#004BB7] z-10" />
                )}
              </button>
            </div>

            {/* Input de búsqueda a la derecha */}
            <div className="flex items-center w-[40%]">
              <svg
                className="w-5 h-5 text-gray-400 absolute transform -translate-y-1/2 right-[490px] top-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Busca aquí..."
                className="w-full px-14 py-2"
              />
            </div>
          </div>

          {/* Contenido con padding */}
          {renderMainTabContent()}
        </div>
      </div>
    </div>
  );
};

