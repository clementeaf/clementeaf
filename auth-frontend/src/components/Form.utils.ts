import type { RegisterRequest, LoginRequest } from '../api/types';

/**
 * Tipo de formulario
 */
type FormType = 'register' | 'login';

/**
 * Datos del formulario
 */
type FormData = RegisterRequest | LoginRequest;

/**
 * Errores de validación
 */
export type ValidationErrors = Record<string, string>;

/**
 * Valida los campos del formulario según el DTO correspondiente
 * @param formData - Datos del formulario
 * @param _type - Tipo de formulario (register o login)
 * @returns Errores de validación o null si no hay errores
 */
export const validateForm = (
  formData: FormData,
  _type: FormType
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validación de email (común para ambos)
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  // Validación de password (común para ambos)
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Validación de name (solo para register)
  // name es opcional según RegisterDto, no requiere validación

  return errors;
};

/**
 * Prepara los datos del formulario para enviar según el DTO correspondiente
 * @param formData - Datos del formulario
 * @param type - Tipo de formulario (register o login)
 * @returns Datos preparados para enviar
 */
export const prepareFormData = (
  formData: FormData,
  type: FormType
): RegisterRequest | LoginRequest => {
  const submitData = type === 'register'
    ? { ...formData as RegisterRequest }
    : { ...formData as LoginRequest };

  // Si es register y name está vacío, no enviarlo (es opcional)
  if (type === 'register' && !(formData as RegisterRequest).name) {
    delete (submitData as RegisterRequest).name;
  }

  return submitData;
};

