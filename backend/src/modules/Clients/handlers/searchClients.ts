import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para buscar clientes por nombre o RUT
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de clientes encontrados
 */
const searchClientsHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const nombre = queryParams.nombre || '';
  const rut = queryParams.rut || '';
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 10;

  if (isNaN(limit) || limit < 1) {
    return successResponse(400, null, 'El parámetro limit debe ser un número mayor a 0');
  }

  const clientsService = new ClientsService();
  const clients = await clientsService.searchClients({ nombre, rut, limit });

  return successResponse(200, {
    data: clients.map(client => ({
      id: client.id,
      rut: client.rut,
      razonSocial: client.razonSocial,
      nombreCliente: client.nombreCliente,
      rutCompleto: client.rutCompleto,
      giro: client.giro,
      sitioWeb: client.sitioWeb,
      propietarioCliente: client.propietarioCliente,
      tamanoEmpresa: client.tamanoEmpresa,
      segmento: client.segmento,
      subsegmento: client.subsegmento,
      empleados: client.empleados,
      tratos: client.tratos,
      documentoPorDefecto: client.documentoPorDefecto,
      formaPago: client.formaPago,
      listaPrecios: client.listaPrecios,
      ingresosAnuales: client.ingresosAnuales,
      limiteCredito: client.limiteCredito,
      creditoUsado: client.creditoUsado,
      motivoBloqueo: client.motivoBloqueo,
      respaldoRUT: client.respaldoRUT,
      clienteExigeOC: client.clienteExigeOC,
      aprobadoPorFinanzas: client.aprobadoPorFinanzas,
      contactoNombre: client.contactoNombre,
      contactoCargo: client.contactoCargo,
      contactoCorreoElectronico: client.contactoCorreoElectronico,
      contactoTelefono: client.contactoTelefono,
      contactoCountryCode: client.contactoCountryCode,
      contactoCountryDialCode: client.contactoCountryDialCode,
      direccionFacturacion: client.direccionFacturacion,
      regionFacturacion: client.regionFacturacion,
      comunaFacturacion: client.comunaFacturacion,
      codigoPostalFacturacion: client.codigoPostalFacturacion,
      direccionDespacho: client.direccionDespacho,
      regionDespacho: client.regionDespacho,
      comunaDespacho: client.comunaDespacho,
      codigoPostalDespacho: client.codigoPostalDespacho,
      usarMismaDireccion: client.usarMismaDireccion,
      createdAt: client.createdAt?.toISOString(),
      updatedAt: client.updatedAt?.toISOString()
    })),
    total: clients.length
  });
};

export const handler = handlerWrapper(searchClientsHandler);

