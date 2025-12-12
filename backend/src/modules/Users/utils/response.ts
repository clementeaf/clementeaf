import { type APIGatewayProxyResult } from 'aws-lambda';

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
 * Respuesta HTTP exitosa
 * @param statusCode - Código de estado HTTP
 * @param data - Datos a devolver
 * @param message - Mensaje opcional
 * @returns Respuesta HTTP
 */
export const successResponse = (
  statusCode: number,
  data?: unknown,
  message?: string
): APIGatewayProxyResult => {
  const responseBody: Record<string, unknown> = {};
  
  if (message) {
    responseBody.message = message;
  }
  
  if (data) {
    responseBody.data = data;
  }
  
  return {
    statusCode,
    headers: getCorsHeaders(),
    body: JSON.stringify(responseBody)
  };
};

/**
 * Respuesta HTTP de error
 * @param statusCode - Código de estado HTTP
 * @param error - Mensaje de error
 * @returns Respuesta HTTP
 */
export const errorResponse = (
  statusCode: number,
  error: string
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: getCorsHeaders(),
    body: JSON.stringify({ error })
  };
};

/**
 * Mapea mensajes de error a códigos de estado HTTP
 * @param errorMessage - Mensaje de error
 * @returns Código de estado HTTP
 */
export const getErrorStatusCode = (errorMessage: string): number => {
  if (errorMessage.includes('already exists')) return 409;
  if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid token')) return 401;
  if (errorMessage.includes('not found') || errorMessage.includes('no encontrado') || errorMessage.includes('No encontrado')) return 404;
  if (errorMessage.includes('required') || errorMessage.includes('invalid')) return 400;
  return 500;
};

