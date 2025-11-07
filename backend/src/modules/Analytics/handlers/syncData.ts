import { type APIGatewayProxyEvent } from 'aws-lambda';
import { SyncService } from '../services/SyncService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para sincronizar datos desde S3 a la base de datos
 */
const syncDataHandler = async (_event: APIGatewayProxyEvent) => {
  try {
    const syncService = new SyncService();
    const result = await syncService.syncData();

    return successResponse(200, result, 'Data synchronized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(500, `Error syncing data: ${errorMessage}`);
  }
};

export const handler = handlerWrapper(syncDataHandler);

