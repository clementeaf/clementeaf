import { type Client } from '../../../../services/clientsService';

/**
 * Props del componente ClientInfoSection
 */
interface ClientInfoSectionProps {
  /**
   * Datos del cliente
   */
  client: Client;
}

/**
 * Sección de información general del cliente
 * @param props - Props del componente ClientInfoSection
 * @returns Componente ClientInfoSection
 */
export const ClientInfoSection = ({ client }: ClientInfoSectionProps): React.ReactElement => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información del Cliente</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-600">RUT</label>
          <p className="text-base text-gray-900 mt-1">{client.rutCompleto || client.rut}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Razón Social</label>
          <p className="text-base text-gray-900 mt-1">{client.razonSocial}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Nombre Cliente</label>
          <p className="text-base text-gray-900 mt-1">{client.nombreCliente}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Giro</label>
          <p className="text-base text-gray-900 mt-1">{client.giro}</p>
        </div>

        {client.sitioWeb && (
          <div>
            <label className="text-sm font-medium text-gray-600">Sitio Web</label>
            <p className="text-base text-gray-900 mt-1">
              <a
                href={client.sitioWeb.startsWith('http') ? client.sitioWeb : `https://${client.sitioWeb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#004BB7] hover:underline"
              >
                {client.sitioWeb}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

