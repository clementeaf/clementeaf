import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { type UpdateQuoteDto } from '../dto/CreateQuoteDto';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { EventPublisher } from '../services/EventPublisher';
import { QuoteStatusChangedEventFactory } from '../events/QuoteStatusChangedEvent';
import { QuoteUpdatedEventFactory } from '../events/QuoteUpdatedEvent';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para actualizar una orden de compra
 * @param event - Evento de API Gateway
 * @returns Respuesta con orden de compra actualizada
 */
const updateQuoteHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return errorResponse(400, 'ID de la orden de compra es requerido');
  }

  const quoteId = parseInt(id, 10);
  if (isNaN(quoteId)) {
    return errorResponse(400, 'ID de la orden de compra debe ser un número válido');
  }

  const bodyError = validateBody(event);
  if (bodyError) return bodyError;

  const updateData = parseBody<UpdateQuoteDto>(event.body!);
  if (!updateData) {
    return errorResponse(400, 'Invalid JSON format');
  }

  const quotesService = new QuotesService();
  
  // Obtener la Quote actual para comparar el estado
  const currentQuote = await quotesService.getQuoteById(quoteId);
  const estadoAnterior = currentQuote.estado;
  
  // Actualizar la Quote
  const quote = await quotesService.updateQuote(quoteId, updateData);
  
  // Obtener userId del token si está disponible
  let updatedBy: number | undefined;
  try {
    const token = extractToken(event);
    if (token) {
      const authService = new AuthService();
      const verifiedUser = await authService.verifyToken(token);
      const usersService = new (await import('../../Users/services/UsersService')).UsersService();
      const user = await usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        updatedBy = user.id;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener userId del token:', error);
  }

  const eventPublisher = new EventPublisher();
  const updatedFields = Object.keys(updateData);

  // Si el estado cambió, publicar evento de cambio de estado
  if (updateData.estado && updateData.estado !== estadoAnterior) {
    const statusChangedEvent = QuoteStatusChangedEventFactory.create(
      {
        id: quote.id,
        numeroCotizacion: quote.numeroCotizacion,
        clienteNombre: quote.clienteNombre
      },
      estadoAnterior,
      updateData.estado,
      updatedBy
    );

    eventPublisher.publish('quote.status_changed', statusChangedEvent)
      .then(success => {
        if (success) {
          console.log(`✅ Evento quote.status_changed publicado para quote ID: ${quote.id}`);
        } else {
          console.error(`❌ Error publicando evento quote.status_changed para quote ID: ${quote.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error publicando evento quote.status_changed:`, error);
      });
  } else if (updatedFields.length > 0) {
    // Si se actualizó pero no cambió el estado, publicar evento de actualización
    const updatedEvent = QuoteUpdatedEventFactory.create(
      {
        id: quote.id,
        numeroCotizacion: quote.numeroCotizacion,
        clienteNombre: quote.clienteNombre,
        estado: quote.estado
      },
      updatedBy,
      updatedFields
    );

    eventPublisher.publish('quote.updated', updatedEvent)
      .then(success => {
        if (success) {
          console.log(`✅ Evento quote.updated publicado para quote ID: ${quote.id}`);
        } else {
          console.error(`❌ Error publicando evento quote.updated para quote ID: ${quote.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error publicando evento quote.updated:`, error);
      });
  }

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
    'Orden de compra actualizada exitosamente'
  );
};

export const handler = handlerWrapper(updateQuoteHandler);

