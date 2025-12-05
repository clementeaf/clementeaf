import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { type CreateQuoteDto } from '../dto/CreateQuoteDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody, validateRequiredFields } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { extractToken } from '../../Users/utils/auth';
import { EventPublisher } from '../services/EventPublisher';
import { QuoteCreatedEventFactory } from '../events/QuoteCreatedEvent';
import { AuthService } from '../../Users/services/AuthService';

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

  // Obtener userId del token si está disponible (opcional, no bloquea si falla)
  let createdBy: number | undefined;
  try {
    const token = extractToken(event);
    if (token) {
      const authService = new AuthService();
      const verifiedUser = await authService.verifyToken(token);
      const usersService = new (await import('../../Users/services/UsersService')).UsersService();
      const user = await usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        createdBy = user.id;
      }
    }
  } catch (error) {
    // Si falla la autenticación, continuar sin userId (no crítico)
    console.warn('No se pudo obtener userId del token:', error);
  }

  const quotesService = new QuotesService();
  const quote = await quotesService.createQuote(createQuoteDto);

  // Publicar evento de dominio (no bloqueante)
  const eventPublisher = new EventPublisher();
  const quoteCreatedEvent = QuoteCreatedEventFactory.create(
    {
      id: quote.id,
      numeroCotizacion: quote.numeroCotizacion,
      clienteNombre: quote.clienteNombre,
      estado: quote.estado,
      asesorAsignado: quote.asesorAsignado,
      terminosPago: quote.terminosPago,
      listaPrecios: quote.listaPrecios,
      productos: quote.productos
    },
    createdBy
  );

  // Publicar evento de forma asíncrona (no bloquea la respuesta)
  eventPublisher.publish('quote.created', quoteCreatedEvent)
    .then(success => {
      if (success) {
        console.log(`✅ Evento quote.created publicado para quote ID: ${quote.id}`);
      } else {
        console.error(`❌ Error publicando evento quote.created para quote ID: ${quote.id}`);
      }
    })
    .catch(error => {
      console.error(`❌ Error publicando evento quote.created:`, error);
    });

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
