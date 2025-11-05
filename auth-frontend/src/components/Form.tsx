import { useState, type FormHTMLAttributes, type FormEvent } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import type { RegisterRequest, LoginRequest } from '../api/types';
import { validateForm, prepareFormData, type ValidationErrors } from './Form.utils';

/**
 * Tipo de formulario
 */
type FormType = 'register' | 'login';

/**
 * Props del componente Form
 */
export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  type: FormType;
  onSubmit: (data: RegisterRequest | LoginRequest) => void;
  isLoading?: boolean;
  formClassName?: string;
  forgotPasswordLink?: React.ReactNode;
  registerLink?: React.ReactNode;
}

/**
 * Componente Form que gestiona formulario de registro y login
 * Basado en los DTOs del backend: RegisterDto y LoginDto
 * @param props - Props del form
 * @returns Elemento Form
 */
export const Form = ({ type, onSubmit, isLoading = false, formClassName, className, forgotPasswordLink, registerLink, ...formProps }: FormProps) => {
  // Estado inicial basado en los DTOs del backend
  const [formData, setFormData] = useState<RegisterRequest | LoginRequest>(
    type === 'register'
      ? { email: '', password: '', name: '' }
      : { email: '', password: '' }
  );

  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Maneja el cambio de valores en los inputs
   */
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, type);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const submitData = prepareFormData(formData, type);
    onSubmit(submitData);
  };

  const defaultFormClass = 'flex flex-col items-start justify-start w-full p-4';
  
  return (
    <form 
      {...formProps} 
      onSubmit={handleSubmit} 
      className={className || formClassName || defaultFormClass}
    >
      <Input
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        required
      />
      
      <Input
        type="password"
        label="Password"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        required
      />

      {type === 'login' && forgotPasswordLink && (
        <div className="w-full py-2">
          {forgotPasswordLink}
        </div>
      )}

      {type === 'login' && registerLink && (
        <div className="w-full py-2">
          {registerLink}
        </div>
      )}

      {type === 'register' && (
        <Input
          type="text"
          label="Name (optional)"
          value={(formData as RegisterRequest).name || ''}
          onChange={handleChange('name')}
          error={errors.name}
        />
      )}

      <Button type="submit" isLoading={isLoading}>
        {type === 'register' ? 'Register' : 'Login'}
      </Button>
    </form>
  );
};

