import { type Client } from '../../../services/clientsService';
import { Button, PlusIcon } from '../../../components/commons';

/**
 * Props del componente ClientSidebar
 */
interface ClientSidebarProps {
  /**
   * Datos del cliente
   */
  client: Client;
  /**
   * Callback para crear orden de compra
   */
  onCreateQuote?: () => void;
  /**
   * Callback para añadir sucursal
   */
  onAddBranch?: () => void;
}

/**
 * Componente Sidebar izquierdo con información básica del cliente y acciones
 * @param props - Props del componente ClientSidebar
 * @returns Componente ClientSidebar
 */
export const ClientSidebar = ({
  client,
  onCreateQuote,
  onAddBranch
}: ClientSidebarProps): React.ReactElement => {
  return (
    <div className="w-80 bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      {/* Nombre y ubicación */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {client.nombreCliente || client.razonSocial}
        </h2>
        {(client.regionFacturacion || client.comunaFacturacion) && (
          <p className="text-sm text-gray-500 mt-1">
            {client.comunaFacturacion || client.regionFacturacion || ''}
          </p>
        )}
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Información básica */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="text-sm text-gray-500">RUT</label>
          <p className="text-base text-gray-900 mt-1">{client.rutCompleto || client.rut}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Razón social</label>
          <p className="text-base text-gray-900 mt-1">{client.razonSocial}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">RUT completo</label>
          <p className="text-base text-gray-900 mt-1">{client.rutCompleto || client.rut}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Giro</label>
          <p className="text-base text-gray-900 mt-1">{client.giro}</p>
        </div>

        {client.sitioWeb && (
          <div>
            <label className="text-sm text-gray-500">Sitio web</label>
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

      {/* Separador */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Acciones */}
      <div className="space-y-3">
        <Button
          onClick={onCreateQuote}
          className="w-full bg-[#004BB7] text-white hover:bg-[#003a94]"
          leftIcon={<PlusIcon color="white" />}
        >
          Crear orden de compra
        </Button>
        <button
          onClick={onAddBranch}
          className="w-full text-[#004BB7] hover:text-[#003a94] text-sm font-medium text-center"
        >
          Añadir sucursal
        </button>
      </div>
    </div>
  );
};

