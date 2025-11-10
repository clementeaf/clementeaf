import { type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * Props del componente Input
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
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
}

/**
 * Componente Input headless que maneja la estructura y lógica del input
 * Los estilos se inyectan mediante className
 * @param props - Props del componente Input
 * @returns Componente Input
 */
export const Input = ({
  label,
  containerClassName = '',
  inputClassName = '',
  labelClassName = '',
  leftIcon,
  rightIcon,
  error,
  ...htmlInputProps
}: InputProps): React.ReactElement => {
  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label htmlFor={htmlInputProps.id} className={`text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
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
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${
            htmlInputProps.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
          } ${inputClassName}`}
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

