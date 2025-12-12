import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, getErrorStatusCode } from './response';

/**
 * Headers CORS para las respuestas
 */
const getCorsHeaders = (): Record<string, string> => {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json'
  };
};

/**
 * Wrapper para handlers que NO necesitan base de datos (solo Cognito/servicios externos)
 * @param handler - Función handler a ejecutar
 * @returns Handler envuelto con manejo de errores
 */
export const handlerWrapperWithoutDB = (
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
): ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
      const result = await handler(event);
      
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
      const errorResp = errorResponse(statusCode, errorMessage);
      
      return {
        ...errorResp,
        headers: {
          ...getCorsHeaders(),
          ...errorResp.headers
        }
      };
    }
  };
};
