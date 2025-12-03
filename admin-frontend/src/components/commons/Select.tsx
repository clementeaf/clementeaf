import { useState, useRef, useEffect } from 'react';
import { DropdownIcon } from './icons';

/**
 * Opción para el select
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Props del componente Select
 */
export interface SelectProps {
  /**
   * ID del select
   */
  id?: string;
  /**
   * Label del select
   */
  label?: string;
  /**
   * Valor seleccionado
   */
  value?: string;
  /**
   * Función que se ejecuta cuando cambia el valor
   */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Clases CSS adicionales para el contenedor
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para el select
   */
  selectClassName?: string;
  /**
   * Clases CSS adicionales para el label
   */
  labelClassName?: string;
  /**
   * Mensaje de error
   */
  error?: string;
  /**
   * Opciones del select
   */
  options?: SelectOption[];
  /**
   * Placeholder del select
   */
  placeholder?: string;
  /**
   * Si el select está deshabilitado
   */
  disabled?: boolean;
  /**
   * Si el select es requerido
   */
  required?: boolean;
}

/**
 * Componente Select personalizado con dropdown custom
 * @param props - Props del componente Select
 * @returns Componente Select
 */
export const Select = ({
  id,
  label,
  value = '',
  onChange,
  containerClassName = '',
  selectClassName = '',
  labelClassName = '',
  error,
  options = [],
  placeholder = 'Selecciona una opción',
  disabled = false,
  required = false
}: SelectProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number; openUpward: boolean } | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Obtiene el label de la opción seleccionada
   */
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.value === value);
      setSelectedLabel(selectedOption?.label || '');
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  /**
   * Calcula la posición del dropdown cuando se abre
   */
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Estimar altura del dropdown (aproximadamente 40px por opción + padding)
      const estimatedHeight = Math.min(options.length * 40 + 16, 240); // max-h-60 = 240px
      
      // Si no hay espacio suficiente abajo pero sí arriba, abrir hacia arriba
      const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      
      setDropdownPosition({
        top: openUpward ? rect.top - estimatedHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUpward
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, options.length]);

  /**
   * Cierra el dropdown cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        !(target instanceof Element && target.closest('[data-dropdown]'))
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Maneja la selección de una opción
   */
  const handleSelect = (optionValue: string): void => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: optionValue }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  /**
   * Maneja el toggle del dropdown
   */
  const handleToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`flex flex-col ${containerClassName}`} ref={selectRef}>
      {label && (
        <label htmlFor={id} className={`text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none h-[42px] bg-white text-left flex items-center justify-between gap-2 ${
            error ? 'border-red-500' : ''
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white cursor-pointer'
          } ${selectClassName}`}
        >
          <span className={`truncate flex-1 min-w-0 ${selectedLabel ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedLabel || placeholder}
          </span>
          <DropdownIcon color={disabled ? '#9ca3af' : '#6b7280'} />
        </button>

        {isOpen && !disabled && dropdownPosition && (
          <div
            data-dropdown
            className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-xs text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                    value === option.value ? 'bg-blue-50 text-[#004BB7] font-medium' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-xs">No hay opciones disponibles</div>
            )}
          </div>
        )}
      </div>
      {error && <span className="mt-1 text-sm text-red-600">{error}</span>}
    </div>
  );
};
