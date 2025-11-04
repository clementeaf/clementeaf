import type { InputHTMLAttributes } from 'react';

/**
 * Props del componente Input
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Componente Input reutilizable y agnóstico
 * @param props - Props del input HTML nativo más props adicionales
 * @returns Componente Input
 */
export const Input = ({ label, error, ...inputProps }: InputProps) => {
  return (
    <div>
      {label && <label htmlFor={inputProps.id}>{label}</label>}
      <input {...inputProps} />
      {error && <span>{error}</span>}
    </div>
  );
};

