import { useState, useEffect } from 'react';
import { Input } from '../../../components/commons';
import { billingFormSchema, type BillingFormField } from './BillingForm.schema';
import uploadIcon from '../../../assets/upload.png';

/**
 * Props del componente BillingForm
 */
interface BillingFormProps {
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
 * Componente Formulario de facturación (Paso 3)
 * @param props - Props del componente BillingForm
 * @returns Componente BillingForm
 */
export const BillingForm = ({ onDataChange, initialData, onBack }: BillingFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || 
    billingFormSchema.reduce((acc, field) => {
      if (field.defaultValue) {
        acc[field.name] = field.defaultValue;
      }
      return acc;
    }, {} as Record<string, string>)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

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
    const field = billingFormSchema.find(f => f.name === fieldName);
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
   * Maneja el cambio de un checkbox
   * @param fieldName - Nombre del campo
   * @param checked - Si está marcado
   */
  const handleCheckboxChange = (fieldName: string, checked: boolean): void => {
    const newData = { ...formData, [fieldName]: checked ? 'true' : 'false' };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  /**
   * Maneja el cambio de un archivo
   * @param fieldName - Nombre del campo
   * @param file - Archivo seleccionado
   */
  const handleFileChange = (fieldName: string, file: File | null): void => {
    if (file) {
      setFileNames(prev => ({ ...prev, [fieldName]: file.name }));
      const newData = { ...formData, [fieldName]: file.name };
      setFormData(newData);
      
      if (onDataChange) {
        onDataChange(newData);
      }
    }
  };

  /**
   * Renderiza un campo del formulario
   * @param field - Configuración del campo
   * @returns Elemento del campo
   */
  const renderField = (field: BillingFormField): React.ReactNode => {
    const label = field.optional ? `${field.label} (opcional)` : field.label;
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : 'col-span-1';

    if (field.type === 'checkbox') {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''} flex flex-col`}>
          <div className="flex items-center mt-6">
            <input
              id={field.name}
              type="checkbox"
              checked={formData[field.name] === 'true'}
              onChange={(e): void => handleCheckboxChange(field.name, e.target.checked)}
              className="w-4 h-4 text-[#004BB7] border-gray-300 rounded focus:ring-[#004BB7] focus:ring-2"
            />
            <label htmlFor={field.name} className="ml-2 text-sm font-medium text-gray-700">
              {field.checkboxLabel || label}
            </label>
          </div>
          {errors[field.name] && (
            <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
          )}
        </div>
      );
    }

    if (field.type === 'file') {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''} flex flex-col`}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="relative">
            <input
              id={field.name}
              type="file"
              onChange={(e): void => handleFileChange(field.name, e.target.files?.[0] || null)}
              accept={field.fileConstraints?.allowedFormats?.map(f => `.${f.toLowerCase()}`).join(',')}
              className="hidden"
            />
            <label
              htmlFor={field.name}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <img
                  src={uploadIcon}
                  alt="Upload"
                  className="w-8 h-8 mb-2"
                />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Arrastra el archivo</span> o haz clic para seleccionarlo.
                </p>
                {fileNames[field.name] && (
                  <p className="text-xs text-gray-500 mb-1">{fileNames[field.name]}</p>
                )}
                <p className="text-xs text-gray-500">
                  {field.fileConstraints?.maxSize && `Tamaño máximo: ${field.fileConstraints.maxSize}`}
                  {field.fileConstraints?.allowedFormats && ` • Formatos permitidos: ${field.fileConstraints.allowedFormats.join(', ')}`}
                </p>
              </div>
            </label>
          </div>
          {errors[field.name] && (
            <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
          )}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''} flex flex-col`}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <textarea
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e): void => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent bg-white h-32 resize-none ${
              field.inputClassName || ''
            } ${errors[field.name] ? 'border-red-500' : ''}`}
          />
          {errors[field.name] && (
            <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
          )}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''} flex flex-col`}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="relative">
            <select
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e): void => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent bg-white h-[42px] ${
                field.inputClassName || ''
              } ${errors[field.name] ? 'border-red-500' : ''}`}
            >
              <option value="">{field.placeholder || 'Selecciona una opción'}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors[field.name] && (
            <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
          )}
        </div>
      );
    }

    // Renderizar input normal o con prefijo
    if (field.prefix) {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''} flex flex-col`}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
              {field.prefix}
            </span>
            <input
              id={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e): void => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent bg-white h-[42px] ${
                field.inputClassName || ''
              } ${errors[field.name] ? 'border-red-500' : ''}`}
            />
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
          <span>Volver al Paso 2</span>
        </button>
      )}
      <h2 className="text-lg font-bold text-gray-800 mb-6">Datos de facturación</h2>
      <div className="grid grid-cols-2 gap-4">
        {billingFormSchema.map(renderField)}
      </div>
    </div>
  );
};

