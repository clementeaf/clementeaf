import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { type UpdateQuoteDto } from '../dto/CreateQuoteDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para actualizar una cotización
 * @param event - Evento de API Gateway
 * @returns Respuesta con cotización actualizada
 */
const updateQuoteHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID de la cotización es requerido');
  }

  const quoteId = parseInt(id, 10);
  if (isNaN(quoteId)) {
    return errorResponse(400, 'ID de la cotización debe ser un número válido');
  }

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const updateData = parseBody<UpdateQuoteDto>(event.body!);
  if (!updateData) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const quotesService = new QuotesService();
  const quote = await quotesService.updateQuote(quoteId, updateData);

  return successResponse(
    200,
    {
      id: quote.id,
      clienteNombre: quote.clienteNombre,
      numeroCotizacion: quote.numeroCotizacion,
      estado: quote.estado,
      createdAt: quote.createdAt?.toISOString(),
      updatedAt: quote.updatedAt?.toISOString()
    },
    'Cotización actualizada exitosamente'
  );
};

export const handler = handlerWrapper(updateQuoteHandler);

