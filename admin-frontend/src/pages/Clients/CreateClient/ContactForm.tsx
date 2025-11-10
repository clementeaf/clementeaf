import { useState, useEffect } from 'react';
import { Input, CountrySelector, type Country } from '../../../components/commons';
import { getCountryByCode } from '../../../components/commons/countries';
import { contactFormSchema, type ContactFormField } from './ContactForm.schema';

/**
 * Props del componente ContactForm
 */
interface ContactFormProps {
  /**
   * Función para actualizar los datos del formulario
   */
  onDataChange?: (data: Record<string, string>) => void;
  /**
   * Datos iniciales del formulario
   */
  initialData?: Record<string, string>;
  /**
   * Función para volver al paso anterior
   */
  onBack?: () => void;
}

/**
 * Componente Formulario de contacto (Paso 4)
 * @param props - Props del componente ContactForm
 * @returns Componente ContactForm
 */
export const ContactForm = ({ onDataChange, initialData, onBack }: ContactFormProps) => {
  const defaultCountry = getCountryByCode('CL');
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const baseData = initialData || 
      contactFormSchema.reduce((acc, field) => {
        if (field.defaultValue) {
          acc[field.name] = field.defaultValue;
        }
        return acc;
      }, {} as Record<string, string>);
    
    // Inicializar país por defecto si no existe
    if (!baseData.countryCode && defaultCountry) {
      baseData.countryCode = defaultCountry.code;
      baseData.countryDialCode = defaultCountry.dialCode;
    }
    
    return baseData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(defaultCountry);

  /**
   * Sincroniza el estado local con initialData cuando cambia
   */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => {
        const hasChanges = Object.keys(initialData).some(
          key => prev[key] !== initialData[key]
        );
        return hasChanges ? { ...prev, ...initialData } : prev;
      });
      
      // Restaurar país seleccionado si existe en initialData
      if (initialData.countryCode) {
        const country = getCountryByCode(initialData.countryCode);
        if (country) {
          setSelectedCountry(country);
        }
      }
    }
  }, [initialData]);


  /**
   * Maneja el cambio de un campo
   * @param fieldName - Nombre del campo
   * @param value - Nuevo valor
   */
  const handleFieldChange = (fieldName: string, value: string): void => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }

    // Validar campo si tiene función de validación
    const field = contactFormSchema.find(f => f.name === fieldName);
    if (field?.validate) {
      const error = field.validate(value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /**
   * Maneja el cambio del país seleccionado
   * @param country - País seleccionado
   */
  const handleCountryChange = (country: Country): void => {
    setSelectedCountry(country);
    const newData = { ...formData, countryCode: country.code, countryDialCode: country.dialCode };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  /**
   * Renderiza un campo del formulario
   * @param field - Configuración del campo
   * @returns Elemento del campo
   */
  const renderField = (field: ContactFormField): React.ReactNode => {
    const label = field.optional ? `${field.label} (opcional)` : field.label;
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : 'col-span-1';

    // Renderizar campo de teléfono con selector de país
    if (field.type === 'phone') {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''} flex flex-col`}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="flex gap-2">
            <CountrySelector
              value={formData.countryCode || selectedCountry?.code}
              onChange={handleCountryChange}
            />
            <div className="flex-1">
              <input
                id={field.name}
                type="tel"
                value={formData[field.name] || ''}
                onChange={(e): void => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent bg-white h-[42px] ${
                  field.inputClassName || ''
                } ${errors[field.name] ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
          {errors[field.name] && (
            <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
          )}
        </div>
      );
    }

    // Renderizar input normal usando Input component para consistencia
    return (
      <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''}`}>
        <Input
          id={field.name}
          label={label}
          type={field.type || 'text'}
          value={formData[field.name] || ''}
          onChange={(e): void => handleFieldChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          inputClassName={field.inputClassName}
          error={errors[field.name] || undefined}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="text-[#004BB7] hover:text-blue-600 text-sm font-medium mb-4 flex items-center gap-1"
        >
          <span>←</span>
          <span>Volver al Paso 3</span>
        </button>
      )}
      <h2 className="text-lg font-bold text-gray-800 mb-6">Contacto principal</h2>
      <div className="grid grid-cols-2 gap-4">
        {contactFormSchema.map(renderField)}
      </div>
    </div>
  );
};

