import { useParams, useNavigate } from 'react-router-dom';
import { useClientById } from '../../hooks/useClients';
import { routes } from '../../routes';

/**
 * Página de detalles del cliente
 * @returns Componente ClientDetails
 */
export const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = id ? parseInt(id, 10) : null;

  console.log('ClientDetails - ID de la URL:', id, 'ID parseado:', clientId);

  const { data: client, isLoading, error } = useClientById(clientId);

  /**
   * Maneja el click en el botón de volver
   */
  const handleBack = (): void => {
    navigate(routes.clients);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-gray-500">Cargando detalles del cliente...</div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const isNotFound = errorMessage.includes('no encontrado') || errorMessage.includes('not found');
    
    return (
      <div className="w-full h-full flex items-center justify-center flex-col gap-4">
        <div className={`text-lg ${isNotFound ? 'text-gray-500' : 'text-red-500'}`}>
          {isNotFound ? 'Cliente no encontrado' : 'Error al cargar los detalles del cliente'}
        </div>
        {!isNotFound && (
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Clientes
          </button>
        )}
      </div>
    );
  }

  if (!client) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col gap-4">
        <div className="text-lg text-gray-500">Cliente no encontrado</div>
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver a Clientes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Detalles del Cliente
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Información del Cliente
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-600">RUT</label>
              <p className="text-base text-gray-900">{client.rutCompleto || client.rut}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Razón Social</label>
              <p className="text-base text-gray-900">{client.razonSocial}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre Cliente</label>
              <p className="text-base text-gray-900">{client.nombreCliente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Giro</label>
              <p className="text-base text-gray-900">{client.giro}</p>
            </div>
            {client.sitioWeb && (
              <div>
                <label className="text-sm font-medium text-gray-600">Sitio Web</label>
                <p className="text-base text-gray-900">
                  <a
                    href={client.sitioWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {client.sitioWeb}
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Segmentación */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Segmentación
            </h2>
            {client.propietarioCliente && (
              <div>
                <label className="text-sm font-medium text-gray-600">Propietario Cliente</label>
                <p className="text-base text-gray-900">{client.propietarioCliente}</p>
              </div>
            )}
            {client.tamanoEmpresa && (
              <div>
                <label className="text-sm font-medium text-gray-600">Tamaño Empresa</label>
                <p className="text-base text-gray-900">{client.tamanoEmpresa}</p>
              </div>
            )}
            {client.segmento && (
              <div>
                <label className="text-sm font-medium text-gray-600">Segmento</label>
                <p className="text-base text-gray-900">{client.segmento}</p>
              </div>
            )}
            {client.subsegmento && (
              <div>
                <label className="text-sm font-medium text-gray-600">Subsegmento</label>
                <p className="text-base text-gray-900">{client.subsegmento}</p>
              </div>
            )}
            {client.empleados !== null && (
              <div>
                <label className="text-sm font-medium text-gray-600">Empleados</label>
                <p className="text-base text-gray-900">{client.empleados}</p>
              </div>
            )}
            {client.tratos && (
              <div>
                <label className="text-sm font-medium text-gray-600">Tratos</label>
                <p className="text-base text-gray-900">{client.tratos}</p>
              </div>
            )}
          </div>

          {/* Facturación */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Facturación
            </h2>
            {client.documentoPorDefecto && (
              <div>
                <label className="text-sm font-medium text-gray-600">Documento por Defecto</label>
                <p className="text-base text-gray-900">{client.documentoPorDefecto}</p>
              </div>
            )}
            {client.formaPago && (
              <div>
                <label className="text-sm font-medium text-gray-600">Forma de Pago</label>
                <p className="text-base text-gray-900">{client.formaPago}</p>
              </div>
            )}
            {client.listaPrecios && (
              <div>
                <label className="text-sm font-medium text-gray-600">Lista de Precios</label>
                <p className="text-base text-gray-900">{client.listaPrecios}</p>
              </div>
            )}
            {client.ingresosAnuales !== null && (
              <div>
                <label className="text-sm font-medium text-gray-600">Ingresos Anuales</label>
                <p className="text-base text-gray-900">
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP'
                  }).format(client.ingresosAnuales)}
                </p>
              </div>
            )}
            {client.limiteCredito !== null && (
              <div>
                <label className="text-sm font-medium text-gray-600">Límite de Crédito</label>
                <p className="text-base text-gray-900">
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP'
                  }).format(client.limiteCredito)}
                </p>
              </div>
            )}
            {client.creditoUsado !== null && (
              <div>
                <label className="text-sm font-medium text-gray-600">Crédito Usado</label>
                <p className="text-base text-gray-900">
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP'
                  }).format(client.creditoUsado)}
                </p>
              </div>
            )}
            {client.motivoBloqueo && (
              <div>
                <label className="text-sm font-medium text-gray-600">Motivo de Bloqueo</label>
                <p className="text-base text-red-600">{client.motivoBloqueo}</p>
              </div>
            )}
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Cliente Exige OC</label>
                <p className="text-base text-gray-900">
                  {client.clienteExigeOC ? 'Sí' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Aprobado por Finanzas</label>
                <p className="text-base text-gray-900">
                  {client.aprobadoPorFinanzas ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Contacto
            </h2>
            {client.contactoNombre && (
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-base text-gray-900">{client.contactoNombre}</p>
              </div>
            )}
            {client.contactoCargo && (
              <div>
                <label className="text-sm font-medium text-gray-600">Cargo</label>
                <p className="text-base text-gray-900">{client.contactoCargo}</p>
              </div>
            )}
            {client.contactoCorreoElectronico && (
              <div>
                <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                <p className="text-base text-gray-900">
                  <a
                    href={`mailto:${client.contactoCorreoElectronico}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {client.contactoCorreoElectronico}
                  </a>
                </p>
              </div>
            )}
            {client.contactoTelefono && (
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-base text-gray-900">
                  {client.contactoCountryDialCode && `${client.contactoCountryDialCode} `}
                  {client.contactoTelefono}
                </p>
              </div>
            )}
          </div>

          {/* Dirección de Facturación */}
          {(client.direccionFacturacion || client.regionFacturacion || client.comunaFacturacion) && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Dirección de Facturación
              </h2>
              {client.direccionFacturacion && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Dirección</label>
                  <p className="text-base text-gray-900">{client.direccionFacturacion}</p>
                </div>
              )}
              {client.regionFacturacion && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Región</label>
                  <p className="text-base text-gray-900">{client.regionFacturacion}</p>
                </div>
              )}
              {client.comunaFacturacion && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Comuna</label>
                  <p className="text-base text-gray-900">{client.comunaFacturacion}</p>
                </div>
              )}
              {client.codigoPostalFacturacion && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Código Postal</label>
                  <p className="text-base text-gray-900">{client.codigoPostalFacturacion}</p>
                </div>
              )}
            </div>
          )}

          {/* Dirección de Despacho */}
          {(client.direccionDespacho || client.regionDespacho || client.comunaDespacho) && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Dirección de Despacho
              </h2>
              {client.direccionDespacho && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Dirección</label>
                  <p className="text-base text-gray-900">{client.direccionDespacho}</p>
                </div>
              )}
              {client.regionDespacho && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Región</label>
                  <p className="text-base text-gray-900">{client.regionDespacho}</p>
                </div>
              )}
              {client.comunaDespacho && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Comuna</label>
                  <p className="text-base text-gray-900">{client.comunaDespacho}</p>
                </div>
              )}
              {client.codigoPostalDespacho && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Código Postal</label>
                  <p className="text-base text-gray-900">{client.codigoPostalDespacho}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

