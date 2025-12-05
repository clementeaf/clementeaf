import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { initializeDatabase } from '../../../config/database';
import { errorResponse, getErrorStatusCode } from './response';

/**
 * Headers CORS para las respuestas
 */
const getCorsHeaders = (): Record<string, string> => {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json'
  };
};

/**
 * Wrapper para handlers que maneja inicialización de DB y errores
 * @param handler - Función handler a ejecutar
 * @returns Handler envuelto con manejo de errores
 */
export const handlerWrapper = (
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Manejar requests OPTIONS (preflight CORS)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          ...getCorsHeaders(),
          'Access-Control-Max-Age': '86400'
        },
        body: ''
      };
    }

    try {
      await initializeDatabase();
      const result = await handler(event);
      // Asegurar que todas las respuestas tengan headers CORS
      return {
        ...result,
        headers: {
          ...getCorsHeaders(),
          ...result.headers
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = getErrorStatusCode(errorMessage);
      return errorResponse(statusCode, errorMessage);
    }
  };
};

