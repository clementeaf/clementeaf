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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello from Serverless v3!',
      event: event.path
    })
  };
};

