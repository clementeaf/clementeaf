import { type Client } from '../../../../services/clientsService';

/**
 * Props del componente ContactSection
 */
interface ContactSectionProps {
  /**
   * Datos del cliente
   */
  client: Client;
}

/**
 * Sección de contacto del cliente
 * @param props - Props del componente ContactSection
 * @returns Componente ContactSection
 */
export const ContactSection = ({ client }: ContactSectionProps): React.ReactElement => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contacto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client.contactoNombre && (
          <div>
            <label className="text-sm font-medium text-gray-600">Nombre</label>
            <p className="text-base text-gray-900 mt-1">{client.contactoNombre}</p>
          </div>
        )}

        {client.contactoCargo && (
          <div>
            <label className="text-sm font-medium text-gray-600">Cargo</label>
            <p className="text-base text-gray-900 mt-1">{client.contactoCargo}</p>
          </div>
        )}

        {client.contactoCorreoElectronico && (
          <div>
            <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
            <p className="text-base text-gray-900 mt-1">
              <a
                href={`mailto:${client.contactoCorreoElectronico}`}
                className="text-[#004BB7] hover:underline"
              >
                {client.contactoCorreoElectronico}
              </a>
            </p>
          </div>
        )}

        {client.contactoTelefono && (
          <div>
            <label className="text-sm font-medium text-gray-600">Teléfono</label>
            <p className="text-base text-gray-900 mt-1">
              {client.contactoCountryDialCode && `${client.contactoCountryDialCode} `}
              {client.contactoTelefono}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

