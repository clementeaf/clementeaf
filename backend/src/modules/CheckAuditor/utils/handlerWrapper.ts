import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, getErrorStatusCode } from '../../Users/utils/response';

/**
 * Wrapper para handlers de CheckAuditor que maneja errores sin inicializar DB
 * CheckAuditor solo necesita hacer llamadas HTTP, no requiere base de datos
 * @param handler - Función handler a ejecutar
 * @returns Handler envuelto con manejo de errores
 */
export const handlerWrapper = (
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = getErrorStatusCode(errorMessage);
      return errorResponse(statusCode, errorMessage);
    }
  };
};

