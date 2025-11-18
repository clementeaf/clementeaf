import { type InputHTMLAttributes } from 'react';

/**
 * Props del componente Toggle
 */
export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Etiqueta del toggle
   */
  label?: string;
  /**
   * Clases CSS adicionales para el contenedor
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para el label
   */
  labelClassName?: string;
}

/**
 * Componente Toggle (Switch) personalizado
 * @param props - Props del componente Toggle
 * @returns Componente Toggle
 */
export const Toggle = ({
  label,
  containerClassName = '',
  labelClassName = '',
  className = '',
  checked = false,
  disabled = false,
  onChange,
  ...htmlInputProps
}: ToggleProps): React.ReactElement => {
  return (
    <div className={`flex items-center ${containerClassName}`}>
      <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          {...htmlInputProps}
        />
        <div className={`
          relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50' : ''}
          ${className}
        `}>
          <div className={`
            absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `} />
        </div>
        {label && (
          <span className={`ml-3 text-sm font-medium text-gray-700 ${labelClassName} ${disabled ? 'opacity-50' : ''}`}>
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

