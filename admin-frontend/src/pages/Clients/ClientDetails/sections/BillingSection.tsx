import { type Client } from '../../../../services/clientsService';

/**
 * Props del componente BillingSection
 */
interface BillingSectionProps {
  /**
   * Datos del cliente
   */
  client: Client;
}

/**
 * Sección de datos de facturación del cliente
 * @param props - Props del componente BillingSection
 * @returns Componente BillingSection
 */
export const BillingSection = ({ client }: BillingSectionProps): React.ReactElement => {
  const formatCurrency = (value: number | string | null): string => {
    if (value === null || value === undefined) return '$ 0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(numValue);
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex-shrink-0">Datos de facturación</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
        <div>
          <label className="text-sm font-medium text-gray-600">Documento por defecto</label>
          <p className="text-base text-gray-900 mt-1">{client.documentoPorDefecto || 'Documento por defecto'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Forma de pago</label>
          <p className="text-base text-gray-900 mt-1">{client.formaPago || 'Contado'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Lista de precios</label>
          <p className="text-base text-gray-900 mt-1">{client.listaPrecios || 'General'}</p>
        </div>

        {client.ingresosAnuales !== null && (
          <div>
            <label className="text-sm font-medium text-gray-600">Ingresos anuales</label>
            <p className="text-base text-gray-900 mt-1">{formatCurrency(client.ingresosAnuales)}</p>
          </div>
        )}

        {client.limiteCredito !== null && (
          <div>
            <label className="text-sm font-medium text-gray-600">Límite de crédito</label>
            <p className="text-base text-gray-900 mt-1">{formatCurrency(client.limiteCredito)}</p>
          </div>
        )}

        {client.creditoUsado !== null && (
          <div>
            <label className="text-sm font-medium text-gray-600">Crédito usado</label>
            <p className="text-base text-gray-900 mt-1">{formatCurrency(client.creditoUsado)}</p>
          </div>
        )}

        {client.motivoBloqueo && (
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">Motivo de bloqueo</label>
            <p className="text-base text-red-600 mt-1">{client.motivoBloqueo}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600">¿Cliente exige OC para facturación?</label>
          <p className="text-base text-gray-900 mt-1">{client.clienteExigeOC ? 'Sí' : 'No'}</p>
        </div>

        {client.respaldoRUT && (
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">Respaldo RUT</label>
            <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-600">PDF</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nombre del archivo.pdf</p>
                <p className="text-xs text-gray-500">12 MB • PDF</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <span className="text-sm text-gray-600">Descargar</span>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <span className="text-sm text-gray-600">Ver</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

