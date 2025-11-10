import { useState, useRef, useEffect } from 'react';
import { countries, type Country, getCountryByCode, getCountryByDialCode } from './countries';
import { DropdownIcon } from './icons';

/**
 * Props del componente CountrySelector
 */
export interface CountrySelectorProps {
  /**
   * Valor seleccionado (código del país o código telefónico)
   */
  value?: string;
  /**
   * Función que se ejecuta cuando cambia el país seleccionado
   */
  onChange?: (country: Country) => void;
  /**
   * Si el selector está deshabilitado
   */
  disabled?: boolean;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente selector de país con bandera y código telefónico
 * @param props - Props del componente CountrySelector
 * @returns Componente CountrySelector
 */
export const CountrySelector = ({
  value,
  onChange,
  disabled = false,
  className = ''
}: CountrySelectorProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value) {
      const country = getCountryByCode(value) || getCountryByDialCode(value);
      return country;
    }
    return countries[0];
  });
  const selectorRef = useRef<HTMLDivElement>(null);

  /**
   * Actualiza el país seleccionado cuando cambia el valor
   */
  useEffect(() => {
    if (value) {
      const country = getCountryByCode(value) || getCountryByDialCode(value);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [value]);

  /**
   * Cierra el dropdown cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
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
   * Maneja la selección de un país
   */
  const handleSelect = (country: Country): void => {
    setSelectedCountry(country);
    if (onChange) {
      onChange(country);
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
    <div className={`relative flex-shrink-0 ${className}`} ref={selectorRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center border border-gray-300 rounded-lg bg-white h-[42px] px-3 gap-2 focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span className="text-sm text-gray-700">{selectedCountry.dialCode}</span>
        <DropdownIcon color={disabled ? '#9ca3af' : '#6b7280'} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-[280px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2 ${
                selectedCountry.code === country.code ? 'bg-blue-50 text-[#004BB7] font-medium' : 'text-gray-900'
              }`}
            >
              <span className="text-lg">{country.flag}</span>
              <span className="flex-1">{country.name}</span>
              <span className="text-sm text-gray-500">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

