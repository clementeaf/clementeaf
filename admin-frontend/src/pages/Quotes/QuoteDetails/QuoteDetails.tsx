import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuoteById } from '../../../hooks/useQuotes';
import { routes } from '../../../routes';
import { type TabItem, ChevronRightIcon, Button } from '../../../components/commons';
import { QuoteSidebar } from './QuoteSidebar';
import {
  QuoteClientSection,
  QuoteConditionsSection,
  QuoteProductsSection,
  QuoteContactSection
} from './sections';

/**
 * Página de detalles de orden de compra
 * @returns Componente QuoteDetails
 */
export const QuoteDetails = (): React.ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quoteId = id ? parseInt(id, 10) : null;

  const { data: quote, isLoading, error } = useQuoteById(quoteId);

  // Estado para tabs principales
  const [mainTab, setMainTab] = useState<string>('info');

  // Estado para sub-tabs de información
  const [infoTab, setInfoTab] = useState<string>('all');

  /**
   * Maneja el click en el botón de volver
   */
  const handleBack = useCallback((): void => {
    navigate(routes.quotes);
  }, [navigate]);

  // Sub-tabs de información - se recrean cuando cambia la orden de compra
  const infoTabs = useMemo((): TabItem[] => {
    if (!quote) return [];

    return [
      {
        id: 'all',
        label: 'Ver todo',
        content: (
          <div className="h-full flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <QuoteClientSection quote={quote} />
            </div>
            <div className="flex-1 overflow-hidden">
              <QuoteConditionsSection quote={quote} />
            </div>
            <div className="flex-1 overflow-hidden">
              <QuoteProductsSection quote={quote} />
            </div>
            <div className="flex-1 overflow-hidden">
              <QuoteContactSection quote={quote} />
            </div>
          </div>
        )
      },
      {
        id: 'client',
        label: 'Cliente',
        content: <QuoteClientSection quote={quote} />
      },
      {
        id: 'conditions',
        label: 'Condiciones',
        content: <QuoteConditionsSection quote={quote} />
      },
      {
        id: 'products',
        label: 'Productos',
        content: <QuoteProductsSection quote={quote} />
      },
      {
        id: 'contact',
        label: 'Contacto',
        content: <QuoteContactSection quote={quote} />
      }
    ];
  }, [quote]);

  // Manejar estados de carga y error
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-gray-500">Cargando orden de compra...</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-lg text-red-500">
          {error instanceof Error ? error.message : 'Error al cargar la orden de compra'}
        </div>
        <Button onClick={handleBack} className="bg-[#0052C9] text-white hover:bg-[#004BB7]">
          Volver a órdenes de compra
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRightIcon color="#6B7280" className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Orden de compra #{quote.numeroCotizacion || quote.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Cliente: {quote.clienteNombre || 'Sin nombre'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            quote.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
            quote.estado === 'enviada' ? 'bg-blue-100 text-blue-800' :
            quote.estado === 'aceptada' ? 'bg-green-100 text-green-800' :
            quote.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {quote.estado || 'borrador'}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <QuoteSidebar 
          quote={quote} 
          activeTab={infoTab}
          onTabChange={setInfoTab}
        />

        {/* Contenido con tabs */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {infoTabs.length > 0 && infoTabs.find(tab => tab.id === infoTab)?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

