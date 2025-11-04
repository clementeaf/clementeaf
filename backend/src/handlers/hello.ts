import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';

/**
 * Handler para el endpoint hello
 * @param event - Evento de API Gateway
 * @returns Respuesta con mensaje de saludo
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Serverless v3!',
      event: event.path
    })
  };
};

