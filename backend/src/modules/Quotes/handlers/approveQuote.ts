import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import { QuotesService } from '../services/QuotesService';
import { EventPublisher } from '../services/EventPublisher';
import { QuoteApprovedEventFactory } from '../events/QuoteApprovedEvent';
import { getUserWithPermissions } from '../../../modules/Users/utils/permissions';

/**
 * Handler para aprobar una nota de venta
 * Cambia el estado a "aprobada" y dispara evento para crear reservas de stock
 */
const approveQuoteHandler = async (event: APIGatewayProxyEvent) => {
  try {
    // Validar autenticación
    const user = await getUserWithPermissions(event);
    if (!user) {
      return errorResponse(401, 'No autenticado');
    }

    const quoteId = event.pathParameters?.id;
    if (!quoteId) {
      return errorResponse(400, 'ID de nota de venta requerido');
    }

    await initializeDatabase();

    const quotesService = new QuotesService();
    
    // Obtener quote actual
    const quote = await quotesService.getQuoteById(parseInt(quoteId));

    // Validar que no esté rechazada o cancelada
    if (quote.estado === 'rechazada' || quote.estado === 'cancelada') {
      return errorResponse(400, `No se puede aprobar una nota de venta ${quote.estado}`);
    }

    // Si ya está aprobada, mantener idempotencia: re-publicar evento quote.approved (reservas idempotentes).
    const updatedQuote = quote.estado === 'aprobada'
      ? quote
      : await quotesService.updateQuote(parseInt(quoteId), { estado: 'aprobada' });

    console.log(`✅ Nota de venta ${quoteId} aprobada/confirmada por usuario ${user.id}`);

    // Publicar evento quote.approved (no bloqueante)
    const eventPublisher = new EventPublisher();
    const approvedEvent = QuoteApprovedEventFactory.create(
      {
        id: updatedQuote.id,
        numeroCotizacion: updatedQuote.numeroCotizacion,
        clienteNombre: updatedQuote.clienteNombre,
        productos: updatedQuote.productos
      },
      user.id
    );

    eventPublisher.publish('quote.approved', approvedEvent)
      .then(success => {
        if (success) {
          console.log(`✅ Evento quote.approved publicado para quote ID: ${updatedQuote.id}`);
        } else {
          console.error(`❌ Error publicando evento quote.approved para quote ID: ${updatedQuote.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error publicando evento quote.approved:`, error);
      });

    return successResponse(200, {
      id: updatedQuote.id,
      numeroCotizacion: updatedQuote.numeroCotizacion,
      estado: updatedQuote.estado,
      clienteNombre: updatedQuote.clienteNombre,
      updatedAt: updatedQuote.updatedAt.toISOString()
    }, 'Nota de venta aprobada exitosamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al aprobar nota de venta';
    console.error('Error en approveQuoteHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(approveQuoteHandler);
