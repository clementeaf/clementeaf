import type { InputHTMLAttributes } from 'react';

/**
 * Props del componente Input
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

/**
 * Componente Input reutilizable y agnóstico
 * Permite personalizar estilos mediante className o usa estilos por defecto
 * @param props - Props del input HTML nativo más props adicionales
 * @returns Componente Input
 */
export const Input = ({ 
  label, 
  error, 
  containerClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  className,
  ...inputProps 
}: InputProps) => {
  const defaultContainerClass = 'flex flex-col items-start justify-start py-4 w-full';
  const defaultLabelClass = 'text-sm font-medium text-gray-700 py-2';
  const defaultInputClass = 'w-full p-2 border border-gray-300 rounded-xl text-sm text-gray-700';
  const defaultErrorClass = 'text-sm text-red-500 py-2';

  return (
    <div className={containerClassName || defaultContainerClass}>
      {label && (
        <label 
          className={labelClassName || defaultLabelClass} 
          htmlFor={inputProps.id}
        >
          {label}
        </label>
      )}
      <input 
        {...inputProps} 
        className={className || inputClassName || defaultInputClass}
      />
      {error && (
        <span className={errorClassName || defaultErrorClass}>
          {error}
        </span>
      )}
    </div>
  );
};

