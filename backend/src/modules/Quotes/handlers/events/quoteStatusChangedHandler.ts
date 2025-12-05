import { type EventBridgeEvent } from 'aws-lambda';
import { QuoteStatusChangedEvent } from '../../events/QuoteStatusChangedEvent';
import { initializeDatabase } from '../../../../config/database';
import { WebSocketConnectionService } from '../../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../../Chat/services/aws/AwsWebSocketClient';
import { IWebSocketClient } from '../../../Chat/interfaces/IWebSocketClient';
import { NotificationsService } from '../../../Notifications/services/NotificationsService';
import { UsersService } from '../../../Users/services/UsersService';

/**
 * Handler para procesar el evento de cambio de estado de nota de venta
 * Este handler se ejecuta cuando EventBridge recibe un evento 'quote.status_changed'
 * 
 * @param event - Evento de EventBridge
 * @returns Respuesta de procesamiento
 */
export const quoteStatusChangedHandler = async (
  event: EventBridgeEvent<'quote.status_changed', QuoteStatusChangedEvent>
): Promise<void> => {
  try {
    const eventData = event.detail;

    console.log(`📋 Procesando evento quote.status_changed para quote ID: ${eventData.quoteId}`);
    console.log(`📊 Datos del evento:`, {
      quoteId: eventData.quoteId,
      numeroCotizacion: eventData.numeroCotizacion,
      clienteNombre: eventData.clienteNombre,
      estadoAnterior: eventData.estadoAnterior,
      estadoNuevo: eventData.estadoNuevo
    });

    // Inicializar base de datos
    await initializeDatabase();

    // Enviar vía WebSocket a todos los usuarios conectados (broadcast)
    // En desarrollo local, usar LocalWebSocketClient
    // En AWS, usar AwsWebSocketClient
    const isLocal = process.env.IS_OFFLINE === 'true' || process.env.NODE_ENV === 'development' || !process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let webSocketClient: IWebSocketClient;
    if (isLocal) {
      const { LocalWebSocketClient } = await import('../../../Chat/services/LocalWebSocketClient');
      webSocketClient = new LocalWebSocketClient();
      console.log('🔧 [LOCAL] Usando LocalWebSocketClient para desarrollo local');
    } else {
      // Usar el endpoint desde variables de entorno o fallback
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
      action: 'quote_status_changed',
      quoteId: eventData.quoteId.toString(),
      codigoOrden: eventData.numeroCotizacion || `QUOTE-${eventData.quoteId}`,
      estadoAnterior: eventData.estadoAnterior,
      estadoNuevo: eventData.estadoNuevo,
      clienteNombre: eventData.clienteNombre
    };

    // Enviar a todas las conexiones activas (broadcast)
    const sentCount = await connectionService.broadcast(message);
    
    console.log(`📡 Cambio de estado enviado vía WebSocket a ${sentCount} conexión(es)`);

    // Crear notificaciones en la base de datos para usuarios con permisos de Ventas
    try {
      const usersService = new UsersService();
      const notificationsService = new NotificationsService();
      
      // Obtener usuarios con permisos de ventas
      const usersWithSalesPermission = await usersService.getUsersWithPermission('view:ventas:nota-de-venta');
      
      // También incluir usuarios con permiso del módulo completo
      const usersWithModulePermission = await usersService.getUsersWithPermission('module:ventas');
      
      // Combinar y eliminar duplicados
      const allUsers = [...usersWithSalesPermission, ...usersWithModulePermission];
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user.id, user])).values()
      );

      // Crear notificación para cada usuario
      for (const user of uniqueUsers) {
        await notificationsService.createSalesNotification(
          user.id,
          {
            quoteId: eventData.quoteId.toString(),
            codigoOrden: eventData.numeroCotizacion || `QUOTE-${eventData.quoteId}`,
            estadoAnterior: eventData.estadoAnterior,
            estadoNuevo: eventData.estadoNuevo,
            clienteNombre: eventData.clienteNombre
          }
        );
      }

      console.log(`🔔 Notificaciones creadas para ${uniqueUsers.length} usuario(s) con permisos de Ventas`);
    } catch (error) {
      console.error('❌ Error creando notificaciones:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
    
    console.log(`✅ Evento quote.status_changed procesado exitosamente para quote ID: ${eventData.quoteId}`);

  } catch (error) {
    console.error('❌ Error procesando evento quote.status_changed:', error);
    throw error; // Re-lanzar para que EventBridge lo maneje (retry, DLQ, etc.)
  }
};

