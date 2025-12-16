import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { AppDataSource } from '../../../config/database';
import { Invoice } from '../../Accounting/entities/Invoice.entity';
import { InvoiceItem } from '../../Accounting/entities/InvoiceItem.entity';

/**
 * Handler para obtener una orden de compra por su ID
 * @param event - Evento de API Gateway
 * @returns Respuesta con orden de compra encontrada
 */
const getQuoteByIdHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return successResponse(400, null, 'ID de la orden de compra es requerido');
    }

    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return successResponse(400, null, 'ID de la orden de compra debe ser un número válido');
    }

    const quotesService = new QuotesService();
    const quote = await quotesService.getQuoteById(quoteId);

    const includeInvoice = event.queryStringParameters?.includeInvoice !== 'false';
    const includeInvoiceXml = event.queryStringParameters?.includeInvoiceXml === 'true';

    let invoice: Invoice | null = null;
    let invoiceItems: InvoiceItem[] = [];
    if (includeInvoice) {
      invoice = await AppDataSource.getRepository(Invoice).findOne({ where: { quoteId } });
      if (invoice) {
        invoiceItems = await AppDataSource.getRepository(InvoiceItem).find({ where: { invoiceId: invoice.id } });
      }
    }

    return successResponse(200, {
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
      estadoPicking: quote.estadoPicking,
      invoice: invoice
        ? {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate?.toISOString() ?? null,
            currency: invoice.currency,
            netAmount: Number(invoice.netAmount),
            taxAmount: Number(invoice.taxAmount),
            totalAmount: Number(invoice.totalAmount),
            status: invoice.status,
            xml: includeInvoiceXml ? (invoice.xml ?? null) : null
          }
        : null,
      invoiceItems: invoice
        ? invoiceItems.map(i => ({
            id: i.id,
            productCode: i.productCode,
            productName: i.productName,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            lineTotal: Number(i.lineTotal)
          }))
        : [],
      createdAt: quote.createdAt ? quote.createdAt.toISOString() : null,
      updatedAt: quote.updatedAt ? quote.updatedAt.toISOString() : null
    });
  } catch (error) {
    console.error('Error en getQuoteByIdHandler:', error);
    throw error;
  }
};

export const handler = handlerWrapper(getQuoteByIdHandler);

