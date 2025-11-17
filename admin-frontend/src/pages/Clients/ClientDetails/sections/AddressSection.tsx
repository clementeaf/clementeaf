import { type Client } from '../../../../services/clientsService';

/**
 * Props del componente AddressSection
 */
interface AddressSectionProps {
  /**
   * Datos del cliente
   */
  client: Client;
}

/**
 * Sección de direcciones del cliente
 * @param props - Props del componente AddressSection
 * @returns Componente AddressSection
 */
export const AddressSection = ({ client }: AddressSectionProps): React.ReactElement => {
  const hasBillingAddress = client.direccionFacturacion || client.regionFacturacion || client.comunaFacturacion;
  const hasShippingAddress = client.direccionDespacho || client.regionDespacho || client.comunaDespacho;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Direcciones</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dirección de Facturación */}
        {hasBillingAddress && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-700">Dirección de Facturación</h4>
            {client.direccionFacturacion && (
              <div>
                <label className="text-sm font-medium text-gray-600">Dirección</label>
                <p className="text-base text-gray-900 mt-1">{client.direccionFacturacion}</p>
              </div>
            )}
            {client.regionFacturacion && (
              <div>
                <label className="text-sm font-medium text-gray-600">Región</label>
                <p className="text-base text-gray-900 mt-1">{client.regionFacturacion}</p>
              </div>
            )}
            {client.comunaFacturacion && (
              <div>
                <label className="text-sm font-medium text-gray-600">Comuna</label>
                <p className="text-base text-gray-900 mt-1">{client.comunaFacturacion}</p>
              </div>
            )}
            {client.codigoPostalFacturacion && (
              <div>
                <label className="text-sm font-medium text-gray-600">Código Postal</label>
                <p className="text-base text-gray-900 mt-1">{client.codigoPostalFacturacion}</p>
              </div>
            )}
          </div>
        )}

        {/* Dirección de Despacho */}
        {hasShippingAddress && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-700">Dirección de Despacho</h4>
            {client.direccionDespacho && (
              <div>
                <label className="text-sm font-medium text-gray-600">Dirección</label>
                <p className="text-base text-gray-900 mt-1">{client.direccionDespacho}</p>
              </div>
            )}
            {client.regionDespacho && (
              <div>
                <label className="text-sm font-medium text-gray-600">Región</label>
                <p className="text-base text-gray-900 mt-1">{client.regionDespacho}</p>
              </div>
            )}
            {client.comunaDespacho && (
              <div>
                <label className="text-sm font-medium text-gray-600">Comuna</label>
                <p className="text-base text-gray-900 mt-1">{client.comunaDespacho}</p>
              </div>
            )}
            {client.codigoPostalDespacho && (
              <div>
                <label className="text-sm font-medium text-gray-600">Código Postal</label>
                <p className="text-base text-gray-900 mt-1">{client.codigoPostalDespacho}</p>
              </div>
            )}
          </div>
        )}

        {!hasBillingAddress && !hasShippingAddress && (
          <div className="md:col-span-2 text-center py-8 text-gray-500">
            No hay direcciones registradas
          </div>
        )}
      </div>
    </div>
  );
};

