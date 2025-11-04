import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse } from './response';

/**
 * Valida que el body de la petición exista
 * @param event - Evento de API Gateway
 * @returns Error response si no existe body, null si es válido
 */
export const validateBody = (
  event: APIGatewayProxyEvent
): APIGatewayProxyResult | null => {
  if (!event.body) {
    return errorResponse(400, 'Request body is required');
  }
  return null;
};

/**
 * Parsea y valida el JSON del body
 * @param body - Body de la petición
 * @returns Objeto parseado o null si hay error
 */
export const parseBody = <T>(body: string): T | null => {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
};

/**
 * Valida que los campos requeridos estén presentes
 * @param data - Objeto a validar
 * @param requiredFields - Array de campos requeridos
 * @returns Mensaje de error si falta algún campo, null si es válido
 */
export const validateRequiredFields = (
  data: Record<string, unknown>,
  requiredFields: string[]
): string | null => {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return `${field} is required`;
    }
  }
  return null;
};

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si es válido, false si no
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida la longitud mínima de una cadena
 * @param value - Valor a validar
 * @param minLength - Longitud mínima
 * @param fieldName - Nombre del campo para el mensaje de error
 * @returns Mensaje de error si no cumple, null si es válido
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

