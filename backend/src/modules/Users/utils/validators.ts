import { type RegisterDto } from '../dto/RegisterDto';
import { type LoginDto } from '../dto/LoginDto';
import { validateEmail, validateMinLength, validateRequiredFields } from './validation';

/**
 * Valida los datos de registro
 * @param data - Datos a validar
 * @returns Mensaje de error si hay algún problema, null si es válido
 */
export const validateRegisterDto = (data: Partial<RegisterDto>): string | null => {
  const requiredError = validateRequiredFields(
    data as Record<string, unknown>,
    ['email', 'password']
  );
  if (requiredError) return requiredError;

  if (!validateEmail(data.email!)) {
    return 'Invalid email format';
  }

  const passwordError = validateMinLength(data.password!, 6, 'Password');
  if (passwordError) return passwordError;

  return null;
};

/**
 * Valida los datos de login
 * @param data - Datos a validar
 * @returns Mensaje de error si hay algún problema, null si es válido
 */
export const validateLoginDto = (data: Partial<LoginDto>): string | null => {
  const requiredError = validateRequiredFields(
    data as Record<string, unknown>,
    ['email', 'password']
  );
  if (requiredError) return requiredError;

  if (!validateEmail(data.email!)) {
    return 'Invalid email format';
  }

  return null;
};

