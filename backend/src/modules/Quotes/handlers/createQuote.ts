import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { type CreateQuoteDto } from '../dto/CreateQuoteDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para crear una nueva orden de compra
 * @param event - Evento de API Gateway
 * @returns Respuesta con orden de compra creada
 */
const createQuoteHandler = async (event: APIGatewayProxyEvent) => {
  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const createQuoteDto = parseBody<CreateQuoteDto>(event.body!);
  if (!createQuoteDto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  // Validar campos requeridos
  const requiredFields = ['clienteNombre'];
  const validationError = validateRequiredFields(createQuoteDto as unknown as Record<string, unknown>, requiredFields);
  if (validationError) {
    return errorResponse(400, validationError);
  }

  const quotesService = new QuotesService();
  const quote = await quotesService.createQuote(createQuoteDto);

  return successResponse(
    201,
    {
      id: quote.id,
      clienteNombre: quote.clienteNombre,
      numeroCotizacion: quote.numeroCotizacion,
      estado: quote.estado,
      createdAt: quote.createdAt?.toISOString(),
      updatedAt: quote.updatedAt?.toISOString()
    },
    'Orden de compra creada exitosamente'
  );
};

export const handler = handlerWrapper(createQuoteHandler);

