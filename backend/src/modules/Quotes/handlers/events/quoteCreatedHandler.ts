import { type EventBridgeEvent } from 'aws-lambda';
import { QuoteCreatedEvent } from '../../events/QuoteCreatedEvent';
import { initializeDatabase } from '../../../../config/database';
import { QuotesService } from '../../services/QuotesService';
import { QuoteToPickingOrderService } from '../../services/QuoteToPickingOrderService';
import { WebSocketConnectionService } from '../../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../../Chat/services/aws/AwsWebSocketClient';

/**
 * Handler para procesar el evento de nota de venta creada
 * Este handler se ejecuta cuando EventBridge recibe un evento 'quote.created'
 * 
 * @param event - Evento de EventBridge
 * @returns Respuesta de procesamiento
 */
export const quoteCreatedHandler = async (
  event: EventBridgeEvent<'quote.created', QuoteCreatedEvent>
): Promise<void> => {
  try {
    const quoteData = event.detail;

    console.log(`📋 Procesando evento quote.created para quote ID: ${quoteData.quoteId}`);
    console.log(`📊 Datos del evento:`, {
      quoteId: quoteData.quoteId,
      numeroCotizacion: quoteData.numeroCotizacion,
      clienteNombre: quoteData.clienteNombre,
      estado: quoteData.estado,
      createdBy: quoteData.createdBy
    });

    // Inicializar base de datos
    await initializeDatabase();

    // Obtener la Quote completa de la base de datos
    const quotesService = new QuotesService();
    const quote = await quotesService.getQuoteById(quoteData.quoteId);

    // Convertir Quote a PickingOrder
    const pickingOrder = QuoteToPickingOrderService.convert(quote);

    // Calcular monto total desde productos
    let montoTotal = 0;
    if (quote.productos) {
      try {
        const productosJson = JSON.parse(quote.productos);
        if (Array.isArray(productosJson)) {
          productosJson.forEach((prod: { precio?: number; cantidad?: number; cantidadSolicitada?: number }) => {
            const precio = prod.precio || 0;
            const cantidad = prod.cantidad || prod.cantidadSolicitada || 0;
            montoTotal += precio * cantidad;
          });
        }
      } catch (error) {
        console.error('Error calculando monto total:', error);
      }
    }

    // Enviar vía WebSocket a todos los usuarios conectados (broadcast)
    // En producción, podrías filtrar por usuarios con permisos de picking
    // Usar el endpoint desde variables de entorno o fallback
    // El endpoint de Management API es el mismo que el WebSocket pero con https://
    const endpoint = process.env.WEBSOCKET_API_ENDPOINT || 
                    (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') : 
                     'https://5msg0dgwyi.execute-api.us-east-1.amazonaws.com/dev');
    
    const webSocketClient = new AwsWebSocketClient(
      endpoint,
      process.env.AWS_REGION || 'us-east-1'
    );
    const connectionService = new WebSocketConnectionService(webSocketClient);

    // Preparar mensaje para WebSocket con información adicional para Home
    const message = {
      action: 'new_picking_order',
      pickingOrder,
      // Información adicional para Home
      quoteInfo: {
        clienteNombre: quote.clienteNombre,
        monto: montoTotal,
        numeroCotizacion: quote.numeroCotizacion,
        estado: quote.estado
      }
    };

    // Enviar a todas las conexiones activas (broadcast)
    const sentCount = await connectionService.broadcast(message);
    
    console.log(`📡 Nueva orden de picking enviada vía WebSocket a ${sentCount} conexión(es)`);
    console.log(`✅ Evento quote.created procesado exitosamente para quote ID: ${quoteData.quoteId}`);
    console.log(`📦 Orden de picking convertida:`, {
      id: pickingOrder.id,
      codigoOrden: pickingOrder.codigoOrden,
      vendedor: pickingOrder.vendedor,
      cantidadProductos: pickingOrder.cantidadProductos
    });

  } catch (error) {
    console.error('❌ Error procesando evento quote.created:', error);
    throw error; // Re-lanzar para que EventBridge lo maneje (retry, DLQ, etc.)
  }
};
