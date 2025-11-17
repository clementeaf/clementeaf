import { type Client } from '../../../../services/clientsService';

/**
 * Props del componente SegmentationSection
 */
interface SegmentationSectionProps {
  /**
   * Datos del cliente
   */
  client: Client;
}

/**
 * Sección de segmentación del cliente
 * @param props - Props del componente SegmentationSection
 * @returns Componente SegmentationSection
 */
export const SegmentationSection = ({ client }: SegmentationSectionProps): React.ReactElement => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex-shrink-0">Segmentación</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
        {client.propietarioCliente && (
          <div>
            <label className="text-sm font-medium text-gray-600">Propietario del cliente</label>
            <p className="text-base text-gray-900 mt-1">{client.propietarioCliente}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600">Tamaño de empresa</label>
          <p className="text-base text-gray-900 mt-1">{client.tamanoEmpresa || 'Tamaño'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Segmento</label>
          <p className="text-base text-gray-900 mt-1">{client.segmento || 'Segmento'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Subsegmento</label>
          <p className="text-base text-gray-900 mt-1">{client.subsegmento || 'Subsegmento'}</p>
        </div>

        {client.empleados !== null && (
          <div>
            <label className="text-sm font-medium text-gray-600">Empleados</label>
            <p className="text-base text-gray-900 mt-1">{client.empleados}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600">Tratos</label>
          <p className="text-base text-gray-900 mt-1">
            {client.tratos 
              ? new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP'
                }).format(parseFloat(client.tratos))
              : '$ 00000'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

