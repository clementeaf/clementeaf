import { type EventBridgeEvent } from 'aws-lambda';
import { QuoteUpdatedEvent } from '../../events/QuoteUpdatedEvent';
import { initializeDatabase } from '../../../../config/database';
import { WebSocketConnectionService } from '../../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../../Chat/services/aws/AwsWebSocketClient';
import { IWebSocketClient } from '../../../Chat/interfaces/IWebSocketClient';

/**
 * Handler para procesar el evento de actualización de nota de venta
 * Este handler se ejecuta cuando EventBridge recibe un evento 'quote.updated'
 * 
 * @param event - Evento de EventBridge
 * @returns Respuesta de procesamiento
 */
export const quoteUpdatedHandler = async (
  event: EventBridgeEvent<'quote.updated', QuoteUpdatedEvent>
): Promise<void> => {
  try {
    const eventData = event.detail;

    console.log(`📋 Procesando evento quote.updated para quote ID: ${eventData.quoteId}`);

    // Inicializar base de datos
    await initializeDatabase();

    // Enviar vía WebSocket a todos los usuarios conectados (broadcast)
    const isLocal = process.env.IS_OFFLINE === 'true' || process.env.NODE_ENV === 'development' || !process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let webSocketClient: IWebSocketClient;
    if (isLocal) {
      const { LocalWebSocketClient } = await import('../../../Chat/services/LocalWebSocketClient');
      webSocketClient = new LocalWebSocketClient();
      console.log('🔧 [LOCAL] Usando LocalWebSocketClient para desarrollo local');
    } else {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT || 
                      (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') : 
                       'https://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev');
      
      webSocketClient = new AwsWebSocketClient(
        endpoint,
        process.env.AWS_REGION || 'us-east-1'
      );
    }
    
    const connectionService = new WebSocketConnectionService(webSocketClient);

    // Preparar mensaje para WebSocket
    const message = {
      action: 'quote_updated',
      quoteId: eventData.quoteId.toString(),
      numeroCotizacion: eventData.numeroCotizacion,
      clienteNombre: eventData.clienteNombre,
      estado: eventData.estado,
      updatedFields: eventData.updatedFields
    };

    // Enviar a todas las conexiones activas (broadcast)
    const sentCount = await connectionService.broadcast(message);
    
    console.log(`📡 Actualización de quote enviada vía WebSocket a ${sentCount} conexión(es)`);
    console.log(`✅ Evento quote.updated procesado exitosamente para quote ID: ${eventData.quoteId}`);

  } catch (error) {
    console.error('❌ Error procesando evento quote.updated:', error);
    throw error;
  }
};

