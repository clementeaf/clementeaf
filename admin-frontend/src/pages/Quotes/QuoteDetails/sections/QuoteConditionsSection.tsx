import { type Quote } from '../../../../services/quotesService';

/**
 * Props del componente QuoteConditionsSection
 */
interface QuoteConditionsSectionProps {
  /**
   * Datos de la cotización
   */
  quote: Quote;
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
 * Componente Sección de condiciones de la cotización
 * @param props - Props del componente QuoteConditionsSection
 * @returns Componente QuoteConditionsSection
 */
export const QuoteConditionsSection = ({ quote }: QuoteConditionsSectionProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">Condiciones de la cotización</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">N° de cotización</p>
          <p className="text-sm font-medium text-gray-800">{quote.numeroCotizacion || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Fecha</p>
          <p className="text-sm font-medium text-gray-800">{formatDate(quote.fecha)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Términos de pago</p>
          <p className="text-sm font-medium text-gray-800">{quote.terminosPago || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">N° de referencia</p>
          <p className="text-sm font-medium text-gray-800">{quote.numeroReferencia || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Centro de costo</p>
          <p className="text-sm font-medium text-gray-800">{quote.centroCosto || '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Lista de precios</p>
          <p className="text-sm font-medium text-gray-800">{quote.listaPrecios || '-'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-1">Sin costo de envío</p>
          <p className="text-sm font-medium text-gray-800">{quote.sinCostoEnvio ? 'Sí' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

