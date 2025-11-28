import { type Quote } from '../../../services/quotesService';

/**
 * Props del componente QuoteSidebar
 */
interface QuoteSidebarProps {
  /**
   * Datos de la orden de compra
   */
  quote: Quote;
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
 * Formatea una fecha ISO a formato DD/MM/YYYY
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

/**
 * Componente Sidebar para la página de detalles de orden de compra
 * @param props - Props del componente QuoteSidebar
 * @returns Componente QuoteSidebar
 */
export const QuoteSidebar = ({ quote, activeTab, onTabChange }: QuoteSidebarProps) => {
  const tabs = [
    { id: 'all', label: 'Ver todo' },
    { id: 'client', label: 'Cliente' },
    { id: 'conditions', label: 'Condiciones' },
    { id: 'products', label: 'Productos' },
    { id: 'contact', label: 'Contacto' }
  ];

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
      {/* Información básica */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Orden de compra #{quote.numeroCotizacion || quote.id}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {quote.clienteNombre || 'Sin nombre'}
        </p>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Información básica */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="text-sm text-gray-500">Estado</label>
          <p className="text-base text-gray-900 mt-1 capitalize">{quote.estado || 'borrador'}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Fecha</label>
          <p className="text-base text-gray-900 mt-1">{formatDate(quote.fecha)}</p>
        </div>

        {quote.asesorAsignado && (
          <div>
            <label className="text-sm text-gray-500">Asesor asignado</label>
            <p className="text-base text-gray-900 mt-1">{quote.asesorAsignado}</p>
          </div>
        )}

        {quote.numeroReferencia && (
          <div>
            <label className="text-sm text-gray-500">N° de referencia</label>
            <p className="text-base text-gray-900 mt-1">{quote.numeroReferencia}</p>
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Navegación de tabs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información</h3>
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

