import type { FormProps } from '../components/Form';

/**
 * Configuración del formulario de registro
 */
export const registerFormConfig: Omit<FormProps, 'onSubmit'> = {
  type: 'register'
};

/**
 * Configuración del formulario de login
 */
export const loginFormConfig: Omit<FormProps, 'onSubmit'> = {
  type: 'login'
};

