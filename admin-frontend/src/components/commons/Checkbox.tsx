import { type InputHTMLAttributes } from 'react';

/**
 * Props del componente Checkbox
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Etiqueta del checkbox
   */
  label?: string;
  /**
   * Clases CSS adicionales para el contenedor
   */
  containerClassName?: string;
}

/**
 * Componente Checkbox headless que maneja la estructura y lógica del checkbox
 * Los estilos se inyectan mediante className
 * @param props - Props del componente Checkbox
 * @returns Componente Checkbox
 */
export const Checkbox = ({
  label,
  containerClassName = '',
  className = '',
  ...htmlInputProps
}: CheckboxProps): React.ReactElement => {
  return (
    <div className={`flex items-center ${containerClassName}`}>
      <input
        type="checkbox"
        className={`w-4 h-4 rounded border-gray-300 ${className}`}
        {...htmlInputProps}
      />
      {label && (
        <label htmlFor={htmlInputProps.id} className="ml-2 text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};

