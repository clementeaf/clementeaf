import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { initializeDatabase } from '../../../config/database';
import { errorResponse, getErrorStatusCode } from './response';

/**
 * Wrapper para handlers que maneja inicialización de DB y errores
 * @param handler - Función handler a ejecutar
 * @returns Handler envuelto con manejo de errores
 */
export const handlerWrapper = (
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      await initializeDatabase();
      return await handler(event);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = getErrorStatusCode(errorMessage);
      return errorResponse(statusCode, errorMessage);
    }
  };
};

