import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para obtener todas las cotizaciones
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de cotizaciones paginada
 */
const getAllQuotesHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const page = parseInt(event.queryStringParameters?.page || '1', 10);
    const limit = parseInt(event.queryStringParameters?.limit || '50', 10);

    const quotesService = new QuotesService();
    const result = await quotesService.getAllQuotes(page, limit);

    return successResponse(200, {
      data: result.data.map(quote => ({
        id: quote.id,
        clienteNombre: quote.clienteNombre,
        direccionFacturacion: quote.direccionFacturacion,
        telefono: quote.telefono,
        regionComunaCodigo: quote.regionComunaCodigo,
        asesorAsignado: quote.asesorAsignado,
        contactoNombre: quote.contactoNombre,
        contactoTelefono: quote.contactoTelefono,
        contactoEmail: quote.contactoEmail,
        countryCode: quote.countryCode,
        countryDialCode: quote.countryDialCode,
        contactoCountryCode: quote.contactoCountryCode,
        contactoCountryDialCode: quote.contactoCountryDialCode,
        numeroCotizacion: quote.numeroCotizacion,
        fecha: quote.fecha ? quote.fecha.toISOString() : null,
        terminosPago: quote.terminosPago,
        numeroReferencia: quote.numeroReferencia,
        centroCosto: quote.centroCosto,
        listaPrecios: quote.listaPrecios,
        sinCostoEnvio: quote.sinCostoEnvio,
        productos: quote.productos,
        estado: quote.estado,
        createdAt: quote.createdAt ? quote.createdAt.toISOString() : null,
        updatedAt: quote.updatedAt ? quote.updatedAt.toISOString() : null
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error en getAllQuotesHandler:', error);
    throw error;
  }
};

export const handler = handlerWrapper(getAllQuotesHandler);

