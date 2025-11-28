import { type Quote } from '../../../../services/quotesService';

/**
 * Props del componente QuoteContactSection
 */
interface QuoteContactSectionProps {
  /**
   * Datos de la orden de compra
   */
  quote: Quote;
}

/**
 * Componente Sección de contacto
 * @param props - Props del componente QuoteContactSection
 * @returns Componente QuoteContactSection
 */
export const QuoteContactSection = ({ quote }: QuoteContactSectionProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">Contacto principal</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Nombre</p>
          <p className="text-sm font-medium text-gray-800">{quote.contactoNombre || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Correo electrónico</p>
          <p className="text-sm font-medium text-gray-800">{quote.contactoEmail || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Teléfono</p>
          <p className="text-sm font-medium text-gray-800">{quote.contactoTelefono || '-'}</p>
        </div>
      </div>
    </div>
  );
};

