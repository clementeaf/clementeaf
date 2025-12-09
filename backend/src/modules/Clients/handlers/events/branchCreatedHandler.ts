import { type EventBridgeEvent } from 'aws-lambda';
import { BranchCreatedEvent } from '../../events/BranchCreatedEvent';
import { initializeDatabase } from '../../../../config/database';
import { WebSocketConnectionService } from '../../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../../Chat/services/aws/AwsWebSocketClient';
import { IWebSocketClient } from '../../../Chat/interfaces/IWebSocketClient';

export const branchCreatedHandler = async (
  event: EventBridgeEvent<'branch.created', BranchCreatedEvent>
): Promise<void> => {
  try {
    const eventData = event.detail;
    await initializeDatabase();

    const isLocal = process.env.IS_OFFLINE === 'true' || process.env.NODE_ENV === 'development' || !process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let webSocketClient: IWebSocketClient;
    if (isLocal) {
      const { LocalWebSocketClient } = await import('../../../Chat/services/LocalWebSocketClient');
      webSocketClient = new LocalWebSocketClient();
    } else {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT || 
                      (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') : 
                       'https://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev');
      webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
    }
    
    const connectionService = new WebSocketConnectionService(webSocketClient);
    const message = {
      action: 'branch_created',
      branchId: eventData.branchId.toString(),
      clientId: eventData.clientId.toString(),
      nombre: eventData.nombre
    };

    const sentCount = await connectionService.broadcast(message);
    console.log(`📡 Sucursal creada enviada vía WebSocket a ${sentCount} conexión(es)`);
  } catch (error) {
    console.error('❌ Error procesando evento branch.created:', error);
    throw error;
  }
};

