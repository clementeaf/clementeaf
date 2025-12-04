import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener el siguiente número correlativo de orden de compra
 * @param _event - Evento de API Gateway (no utilizado)
 * @returns Respuesta con el siguiente número de orden de compra
 */
const getNextQuoteNumberHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const quotesService = new QuotesService();
    const nextNumber = await quotesService.getNextQuoteNumber();

    return successResponse(200, {
      nextQuoteNumber: nextNumber
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener el siguiente número de orden';
    console.error('Error en getNextQuoteNumberHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getNextQuoteNumberHandler);

