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
    <div className='flex flex-col items-start justify-start py-4'>
      {label && <label className='text-sm font-medium text-gray-700 py-2' htmlFor={inputProps.id}>{label}</label>}
      <input {...inputProps} className='w-full p-2 border border-gray-300 rounded-xl text-sm text-gray-700'/>
      {error && <span className='text-sm text-red-500 py-2'>{error}</span>}
    </div>
  );
};

