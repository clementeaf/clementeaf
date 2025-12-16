import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import { QuotesService } from '../services/QuotesService';
import { getUserWithPermissions } from '../../../modules/Users/utils/permissions';
import { WebSocketConnectionService } from '../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../Chat/services/aws/AwsWebSocketClient';
import { isApprovedForPicking } from '../utils/pickingApproval';

interface UpdatePickingStatusBody {
  estadoPicking: 'iniciado' | 'recolectado' | 'confirmado' | 'en_ruta';
}

/**
 * Handler para actualizar el estado de picking de una nota de venta
 */
const updatePickingStatusHandler = async (event: APIGatewayProxyEvent) => {
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

    const body: UpdatePickingStatusBody = event.body ? JSON.parse(event.body) : {};
    const { estadoPicking } = body;

    // Validar estado picking
    const validEstados = ['iniciado', 'recolectado', 'confirmado', 'en_ruta'];
    if (!estadoPicking || !validEstados.includes(estadoPicking)) {
      return errorResponse(400, `Estado de picking inválido. Valores permitidos: ${validEstados.join(', ')}`);
    }

    await initializeDatabase();

    const quotesService = new QuotesService();
    
    // Obtener quote actual
    const quote = await quotesService.getQuoteById(parseInt(quoteId));

    // Validar que esté aprobada
    if (!isApprovedForPicking(quote.estado)) {
      return errorResponse(400, 'Solo se puede actualizar el estado de picking de notas de venta aprobadas');
    }

    // Actualizar estado de picking
    const updatedQuote = await quotesService.updateQuote(parseInt(quoteId), {
      estadoPicking
    });

    console.log(`✅ Estado de picking actualizado a "${estadoPicking}" para quote ${quoteId} por usuario ${user.id}`);

    // Notificar vía WebSocket (no bloqueante)
    try {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT ||
        (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') :
          'https://4hple5xva0.execute-api.us-east-1.amazonaws.com/dev');
      
      const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
      const connectionService = new WebSocketConnectionService(webSocketClient);

      const message = {
        action: 'picking_status_updated',
        quoteId: updatedQuote.id,
        numeroCotizacion: updatedQuote.numeroCotizacion,
        estadoPicking,
        clienteNombre: updatedQuote.clienteNombre,
        updatedBy: user.id
      };

      await connectionService.broadcast(message);
      console.log(`📡 Notificación WebSocket enviada para cambio de estado picking de quote ${quoteId}`);
    } catch (wsError) {
      console.error('⚠️ Error enviando notificación WebSocket (no crítico):', wsError);
    }

    return successResponse(200, {
      id: updatedQuote.id,
      numeroCotizacion: updatedQuote.numeroCotizacion,
      estado: updatedQuote.estado,
      estadoPicking: updatedQuote.estadoPicking,
      clienteNombre: updatedQuote.clienteNombre,
      updatedAt: updatedQuote.updatedAt.toISOString()
    }, `Estado de picking actualizado a "${estadoPicking}"`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar estado de picking';
    console.error('Error en updatePickingStatusHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(updatePickingStatusHandler);
