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
import { InvoicesService } from '../../Accounting/services/InvoicesService';

/**
 * Handler para confirmar picking y convertir RESERVA → SALIDA
 */
const confirmPickingHandler = async (event: APIGatewayProxyEvent) => {
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

    // Validar que esté aprobada
    if (quote.estado !== 'aprobada') {
      return errorResponse(400, 'Solo se puede confirmar picking de notas de venta aprobadas');
    }

    // Validar que esté en estado 'confirmado'
    if (quote.estadoPicking !== 'confirmado') {
      return errorResponse(400, 'La nota de venta debe estar en estado "confirmado" para procesarla');
    }

    // Buscar reservas asociadas a esta quote
    const movementRepository = AppDataSource.getRepository(StockMovement);
    const reservas = await movementRepository.find({
      where: {
        quoteId: parseInt(quoteId),
        type: MovementType.RESERVA
      }
    });

    if (reservas.length === 0) {
      return errorResponse(400, 'No se encontraron reservas para esta nota de venta');
    }

    console.log(`📦 Encontradas ${reservas.length} reservas para quote ${quoteId}. Convirtiendo a SALIDA...`);

    // Crear movimientos de SALIDA
    const salidasCreadas: any[] = [];
    const salidasMovimientos: StockMovement[] = [];
    for (const reserva of reservas) {
      try {
        // Crear SALIDA de stock físico
        const salida = await stockMovementService.createMovement({
          productId: reserva.productId,
          productCode: reserva.productCode,
          productName: reserva.productName,
          warehouseId: reserva.warehouseId,
          type: MovementType.SALIDA,
          cantidad: reserva.cantidad,
          documento: 'DESPACHO',
          numeroDocumento: quote.numeroCotizacion || `Q-${quote.id}`,
          observaciones: `Salida de stock por confirmación de picking. Nota de venta ${quote.numeroCotizacion}. Reserva original ID: ${reserva.id}`,
          createdBy: user.id,
          quoteId: parseInt(quoteId)
        });

        salidasCreadas.push({
          productId: salida.productId,
          productCode: salida.productCode,
          cantidad: salida.cantidad,
          stockNuevo: salida.stockNuevo,
          reservaOriginalId: reserva.id
        });
        salidasMovimientos.push(salida as unknown as StockMovement);

        console.log(`✅ SALIDA creada: ${salida.productCode} - ${salida.cantidad} unidades. Stock nuevo: ${salida.stockNuevo}`);
      } catch (error) {
        console.error(`❌ Error creando salida para producto ${reserva.productCode}:`, error);
        throw error; // Rollback si falla alguna salida
      }
    }

    // Limpiar reservas para evitar doble procesamiento (idempotencia básica)
    try {
      const reservaIds = reservas.map(r => r.id);
      if (reservaIds.length > 0) {
        await movementRepository.delete(reservaIds);
      }
    } catch (cleanupError) {
      console.error('⚠️ Error eliminando reservas (no crítico):', cleanupError);
    }

    // Actualizar estado de picking a "en_ruta"
    const updatedQuote = await quotesService.updateQuote(parseInt(quoteId), {
      estadoPicking: 'en_ruta'
    });

    // Emitir factura (XML + persistencia + asiento de inventario valorizado)
    let invoice: { id: number; invoiceNumber: string; totalAmount: number } | null = null;
    try {
      const invoicesService = new InvoicesService();
      const created = await invoicesService.emitInvoiceForQuote(updatedQuote as any, salidasMovimientos);
      invoice = { id: created.id, invoiceNumber: created.invoiceNumber, totalAmount: Number(created.totalAmount) };
      console.log(`🧾 Factura emitida: ${created.invoiceNumber} (quote ${updatedQuote.id})`);
    } catch (invError) {
      console.error('❌ Error emitiendo factura (no crítico para despacho):', invError);
    }

    console.log(`✅ Picking confirmado para quote ${quoteId}. ${salidasCreadas.length} salidas de stock creadas`);

    // Notificar vía WebSocket (no bloqueante)
    try {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT ||
        (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') :
          'https://4hple5xva0.execute-api.us-east-1.amazonaws.com/dev');
      
      const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
      const connectionService = new WebSocketConnectionService(webSocketClient);

      const message = {
        action: 'picking_confirmed',
        quoteId: updatedQuote.id,
        numeroCotizacion: updatedQuote.numeroCotizacion,
        clienteNombre: updatedQuote.clienteNombre,
        estadoPicking: updatedQuote.estadoPicking,
        salidasCreadas,
        totalSalidas: salidasCreadas.length
      };

      await connectionService.broadcast(message);
      console.log(`📡 Notificación WebSocket enviada para confirmación de picking de quote ${quoteId}`);
    } catch (wsError) {
      console.error('⚠️ Error enviando notificación WebSocket (no crítico):', wsError);
    }

    return successResponse(200, {
      id: updatedQuote.id,
      numeroCotizacion: updatedQuote.numeroCotizacion,
      estado: updatedQuote.estado,
      estadoPicking: updatedQuote.estadoPicking,
      invoice,
      salidasCreadas,
      totalSalidas: salidasCreadas.length,
      updatedAt: updatedQuote.updatedAt.toISOString()
    }, `Picking confirmado. ${salidasCreadas.length} salidas de stock registradas. Estado: En Ruta`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al confirmar picking';
    console.error('Error en confirmPickingHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(confirmPickingHandler);
