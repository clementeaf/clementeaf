import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todos los clientes con paginación
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de clientes paginada
 */
const getAllClientsHandler = async (event: APIGatewayProxyEvent) => {
  const queryParams = event.queryStringParameters || {};
  
  const page = queryParams.page ? parseInt(queryParams.page, 10) : 1;
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;

  if (isNaN(page) || page < 1) {
    return successResponse(400, null, 'El parámetro page debe ser un número mayor a 0');
  }

  if (isNaN(limit) || limit < 1) {
    return successResponse(400, null, 'El parámetro limit debe ser un número mayor a 0');
  }

  const clientsService = new ClientsService();
  const result = await clientsService.getAllClients(page, limit);

  return successResponse(200, {
    data: result.data.map(client => ({
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
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages
  });
};

export const handler = handlerWrapper(getAllClientsHandler);

