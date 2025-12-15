import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import { QuotesService } from '../services/QuotesService';
import { StockMovementService } from '../../Products/services/StockMovementService';
import { MovementType } from '../../Products/entities/StockMovement.entity';
import { getUserWithPermissions } from '../../../modules/Users/utils/permissions';
import { WebSocketConnectionService } from '../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../Chat/services/aws/AwsWebSocketClient';
import { AppDataSource } from '../../../config/database';
import { StockMovement } from '../../Products/entities/StockMovement.entity';

/**
 * Handler para cancelar una nota de venta y liberar reservas
 */
const cancelQuoteHandler = async (event: APIGatewayProxyEvent) => {
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
    const stockMovementService = new StockMovementService();
    
    // Obtener quote actual
    const quote = await quotesService.getQuoteById(parseInt(quoteId));

    // Validar que no esté ya cancelada
    if (quote.estado === 'cancelada') {
      return errorResponse(400, 'La nota de venta ya está cancelada');
    }

    // Buscar reservas asociadas a esta quote
    const movementRepository = AppDataSource.getRepository(StockMovement);
    const reservas = await movementRepository.find({
      where: {
        quoteId: parseInt(quoteId),
        type: MovementType.RESERVA
      }
    });

    console.log(`📦 Encontradas ${reservas.length} reservas para quote ${quoteId}`);

    // Crear movimientos de AJUSTE inversos para liberar reservas
    const reservasLiberadas: any[] = [];
    for (const reserva of reservas) {
      try {
        // Crear AJUSTE negativo para liberar la reserva
        const ajuste = await stockMovementService.createMovement({
          productId: reserva.productId,
          productCode: reserva.productCode,
          productName: reserva.productName,
          warehouseId: reserva.warehouseId,
          type: MovementType.AJUSTE,
          cantidad: -reserva.cantidad, // Cantidad negativa para liberar
          documento: 'CANCELACION_NOTA_VENTA',
          numeroDocumento: `CANCEL-${quote.numeroCotizacion || `Q-${quote.id}`}`,
          observaciones: `Liberación de reserva por cancelación de nota de venta ${quote.numeroCotizacion}. Reserva original ID: ${reserva.id}`,
          createdBy: user.id
        });

        reservasLiberadas.push({
          productId: ajuste.productId,
          productCode: ajuste.productCode,
          cantidad: Math.abs(ajuste.cantidad),
          reservaOriginalId: reserva.id
        });

        console.log(`✅ Reserva liberada: ${ajuste.productCode} - ${Math.abs(ajuste.cantidad)} unidades`);
      } catch (error) {
        console.error(`❌ Error liberando reserva para producto ${reserva.productCode}:`, error);
      }
    }

    // Actualizar estado a "cancelada"
    const updatedQuote = await quotesService.updateQuote(parseInt(quoteId), {
      estado: 'cancelada',
      estadoPicking: undefined // Limpiar estado de picking
    });

    console.log(`✅ Nota de venta ${quoteId} cancelada por usuario ${user.id}. ${reservasLiberadas.length} reservas liberadas`);

    // Notificar vía WebSocket (no bloqueante)
    try {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT ||
        (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') :
          'https://4hple5xva0.execute-api.us-east-1.amazonaws.com/dev');
      
      const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
      const connectionService = new WebSocketConnectionService(webSocketClient);

      const message = {
        action: 'quote_cancelled',
        quoteId: updatedQuote.id,
        numeroCotizacion: updatedQuote.numeroCotizacion,
        clienteNombre: updatedQuote.clienteNombre,
        reservasLiberadas,
        totalReservasLiberadas: reservasLiberadas.length
      };

      await connectionService.broadcast(message);
      console.log(`📡 Notificación WebSocket enviada para cancelación de quote ${quoteId}`);
    } catch (wsError) {
      console.error('⚠️ Error enviando notificación WebSocket (no crítico):', wsError);
    }

    return successResponse(200, {
      id: updatedQuote.id,
      numeroCotizacion: updatedQuote.numeroCotizacion,
      estado: updatedQuote.estado,
      estadoPicking: updatedQuote.estadoPicking,
      reservasLiberadas,
      totalReservasLiberadas: reservasLiberadas.length,
      updatedAt: updatedQuote.updatedAt.toISOString()
    }, `Nota de venta cancelada. ${reservasLiberadas.length} reservas liberadas`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cancelar nota de venta';
    console.error('Error en cancelQuoteHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(cancelQuoteHandler);
