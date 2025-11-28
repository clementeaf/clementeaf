import { type Quote } from '../../../../services/quotesService';

/**
 * Props del componente QuoteClientSection
 */
interface QuoteClientSectionProps {
  /**
   * Datos de la orden de compra
   */
  quote: Quote;
}

/**
 * Componente Sección de información del cliente
 * @param props - Props del componente QuoteClientSection
 * @returns Componente QuoteClientSection
 */
export const QuoteClientSection = ({ quote }: QuoteClientSectionProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">Información del cliente</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Nombre del cliente</p>
          <p className="text-sm font-medium text-gray-800">{quote.clienteNombre || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Asesor asignado</p>
          <p className="text-sm font-medium text-gray-800">{quote.asesorAsignado || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Dirección de facturación</p>
          <p className="text-sm font-medium text-gray-800">{quote.direccionFacturacion || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Región / Comuna / Código postal</p>
          <p className="text-sm font-medium text-gray-800">{quote.regionComunaCodigo || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Teléfono</p>
          <p className="text-sm font-medium text-gray-800">{quote.telefono || '-'}</p>
        </div>
      </div>
    </div>
  );
};

