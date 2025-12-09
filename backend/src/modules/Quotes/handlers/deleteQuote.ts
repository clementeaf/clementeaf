import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { EventPublisher } from '../services/EventPublisher';
import { QuoteDeletedEventFactory } from '../events/QuoteDeletedEvent';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para eliminar una orden de compra
 * @param event - Evento de API Gateway
 * @returns Respuesta de confirmación
 */
const deleteQuoteHandler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return successResponse(400, null, 'ID de la orden de compra es requerido');
  }

  const quoteId = parseInt(id, 10);
  if (isNaN(quoteId)) {
    return successResponse(400, null, 'ID de la orden de compra debe ser un número válido');
  }

  const quotesService = new QuotesService();
  
  // Obtener la Quote antes de eliminarla para el evento
  const quote = await quotesService.getQuoteById(quoteId);
  
  // Obtener userId del token si está disponible
  let deletedBy: number | undefined;
  try {
    const token = extractToken(event);
    if (token) {
      const authService = new AuthService();
      const verifiedUser = await authService.verifyToken(token);
      const usersService = new (await import('../../Users/services/UsersService')).UsersService();
      const user = await usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        deletedBy = user.id;
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener userId del token:', error);
  }

  // Eliminar la Quote
  await quotesService.deleteQuote(quoteId);

  // Publicar evento de eliminación (no bloqueante)
  const eventPublisher = new EventPublisher();
  const deletedEvent = QuoteDeletedEventFactory.create(
    {
      id: quote.id,
      numeroCotizacion: quote.numeroCotizacion,
      clienteNombre: quote.clienteNombre,
      estado: quote.estado
    },
    deletedBy
  );

  eventPublisher.publish('quote.deleted', deletedEvent)
    .then(success => {
      if (success) {
        console.log(`✅ Evento quote.deleted publicado para quote ID: ${quote.id}`);
      } else {
        console.error(`❌ Error publicando evento quote.deleted para quote ID: ${quote.id}`);
      }
    })
    .catch(error => {
      console.error(`❌ Error publicando evento quote.deleted:`, error);
    });

  return successResponse(200, null, 'Orden de compra eliminada exitosamente');
};

export const handler = handlerWrapper(deleteQuoteHandler);

