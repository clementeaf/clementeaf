import { type EventBridgeEvent } from 'aws-lambda';
import { StockMovementCreatedEvent } from '../../events/StockMovementCreatedEvent';
import { initializeDatabase } from '../../../../config/database';
import { WebSocketConnectionService } from '../../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../../Chat/services/aws/AwsWebSocketClient';
import { IWebSocketClient } from '../../../Chat/interfaces/IWebSocketClient';

/**
 * Handler para procesar el evento de creación de movimiento de stock
 * Este handler se ejecuta cuando EventBridge recibe un evento 'stock_movement.created'
 * 
 * @param event - Evento de EventBridge
 * @returns Respuesta de procesamiento
 */
export const stockMovementCreatedHandler = async (
  event: EventBridgeEvent<'stock_movement.created', StockMovementCreatedEvent>
): Promise<void> => {
  try {
    const eventData = event.detail;

    console.log(`📋 Procesando evento stock_movement.created para movement ID: ${eventData.movementId}`);

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
      action: 'stock_movement_created',
      movementId: eventData.movementId.toString(),
      productId: eventData.productId,
      productCode: eventData.productCode,
      productName: eventData.productName,
      warehouseId: eventData.warehouseId,
      type: eventData.type,
      cantidad: eventData.cantidad,
      stockAnterior: eventData.stockAnterior,
      stockNuevo: eventData.stockNuevo
    };

    // Enviar a todas las conexiones activas (broadcast)
    const sentCount = await connectionService.broadcast(message);
    
    console.log(`📡 Movimiento de stock enviado vía WebSocket a ${sentCount} conexión(es)`);
    console.log(`✅ Evento stock_movement.created procesado exitosamente para movement ID: ${eventData.movementId}`);

  } catch (error) {
    console.error('❌ Error procesando evento stock_movement.created:', error);
    throw error;
  }
};

