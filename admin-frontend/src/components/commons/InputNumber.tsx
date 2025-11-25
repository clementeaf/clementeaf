import { type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * Props del componente InputNumber
 */
export interface InputNumberProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /**
   * Label del input
   */
  label?: string;
  /**
   * Clases CSS adicionales para el contenedor
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para el input
   */
  inputClassName?: string;
  /**
   * Clases CSS adicionales para el label
   */
  labelClassName?: string;
  /**
   * Ícono a mostrar a la izquierda
   */
  leftIcon?: ReactNode;
  /**
   * Ícono a mostrar a la derecha
   */
  rightIcon?: ReactNode;
  /**
   * Mensaje de error
   */
  error?: string;
  /**
   * Valor mínimo permitido
   */
  min?: number;
  /**
   * Valor máximo permitido
   */
  max?: number;
  /**
   * Valor por defecto cuando el input está vacío
   */
  defaultValue?: number;
}

/**
 * Componente InputNumber headless que maneja la estructura y lógica del input numérico
 * Los estilos se inyectan mediante className
 * @param props - Props del componente InputNumber
 * @returns Componente InputNumber
 */
export const InputNumber = ({
  label,
  containerClassName = '',
  inputClassName = '',
  labelClassName = '',
  leftIcon,
  rightIcon,
  error,
  min,
  max,
  value,
  onChange,
  ...htmlInputProps
}: InputNumberProps): React.ReactElement => {
  /**
   * Maneja el cambio del input, validando que solo se ingresen números
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value;
    
    // Permitir vacío para poder borrar
    if (inputValue === '') {
      if (onChange) {
        onChange(e);
      }
      return;
    }

    // Solo permitir números enteros (sin decimales)
    if (/^\d+$/.test(inputValue)) {
      const numValue = parseInt(inputValue, 10);
      
      // Validar min
      if (min !== undefined && numValue < min) {
        return;
      }
      
      // Validar max
      if (max !== undefined && numValue > max) {
        return;
      }
      
      if (onChange) {
        onChange(e);
      }
    } else if (inputValue === '-') {
      // Permitir el signo menos al inicio si min es negativo
      if (onChange) {
        onChange(e);
      }
    }
  };

  /**
   * Maneja el evento onBlur para validar el valor final
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value;
    
    // Si está vacío y hay un min, establecer el min
    if (inputValue === '' && min !== undefined) {
      e.target.value = min.toString();
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: min.toString() }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
    
    if (htmlInputProps.onBlur) {
      htmlInputProps.onBlur(e);
    }
  };

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label htmlFor={htmlInputProps.id} className={`text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent h-[42px] ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${
            htmlInputProps.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
          } ${inputClassName}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          {...htmlInputProps}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="mt-1 text-sm text-red-600">{error}</span>}
    </div>
  );
};

