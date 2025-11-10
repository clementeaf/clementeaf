import { type APIGatewayProxyEvent } from 'aws-lambda';
import { ClientsService } from '../services/ClientsService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener un cliente por su ID
 * @param event - Evento de API Gateway
 * @returns Respuesta con cliente encontrado
 */
const getClientByIdHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return successResponse(400, null, 'ID del cliente es requerido');
  }

  const clientId = parseInt(id, 10);
  if (isNaN(clientId)) {
    return successResponse(400, null, 'ID del cliente debe ser un número válido');
  }

  const clientsService = new ClientsService();
  const client = await clientsService.getClientById(clientId);

  return successResponse(200, {
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
  });
};

export const handler = handlerWrapper(getClientByIdHandler);

