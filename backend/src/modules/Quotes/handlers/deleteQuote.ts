import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';

/**
 * Handler para eliminar una cotización
 * @param event - Evento de API Gateway
 * @returns Respuesta de confirmación
 */
const deleteQuoteHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return successResponse(400, null, 'ID de la cotización es requerido');
  }

  const quoteId = parseInt(id, 10);
  if (isNaN(quoteId)) {
    return successResponse(400, null, 'ID de la cotización debe ser un número válido');
  }

  const quotesService = new QuotesService();
  await quotesService.deleteQuote(quoteId);

  return successResponse(200, null, 'Cotización eliminada exitosamente');
};

export const handler = handlerWrapper(deleteQuoteHandler);

