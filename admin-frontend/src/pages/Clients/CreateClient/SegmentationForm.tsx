import { useState, useEffect } from 'react';
import { Input, Select } from '../../../components/commons';
import { segmentationFormSchema, type SegmentationFormField } from './SegmentationForm.schema';

/**
 * Props del componente SegmentationForm
 */
interface SegmentationFormProps {
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
 * Componente Formulario de segmentación (Paso 2)
 * @param props - Props del componente SegmentationForm
 * @returns Componente SegmentationForm
 */
export const SegmentationForm = ({ onDataChange, initialData, onBack }: SegmentationFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || 
    segmentationFormSchema.reduce((acc, field) => {
      if (field.defaultValue) {
        acc[field.name] = field.defaultValue;
      }
      return acc;
    }, {} as Record<string, string>)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const field = segmentationFormSchema.find(f => f.name === fieldName);
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
   * Renderiza un campo del formulario
   * @param field - Configuración del campo
   * @returns Elemento del campo
   */
  const renderField = (field: SegmentationFormField): React.ReactNode => {
    const hasCustomElement = !!field.customElement;
    const label = field.optional ? `${field.label} (opcional)` : field.label;
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : 'col-span-1';

    if (field.type === 'select') {
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''}`}>
          {hasCustomElement ? (
            <div className="relative">
              <Select
                id={field.name}
                label={label}
                value={formData[field.name] || ''}
                onChange={(e): void => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                options={field.options || []}
                selectClassName={field.inputClassName}
                error={errors[field.name] || undefined}
              />
              {field.customElement}
            </div>
          ) : (
            <Select
              id={field.name}
              label={label}
              value={formData[field.name] || ''}
              onChange={(e): void => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              options={field.options || []}
              selectClassName={field.inputClassName}
              error={errors[field.name] || undefined}
            />
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
            {hasCustomElement && field.customElement}
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
        {hasCustomElement ? (
          <div className="relative">
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
            {field.customElement}
          </div>
        ) : (
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
        )}
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
          <span>Volver al Paso 1</span>
        </button>
      )}
      <h2 className="text-lg font-bold text-gray-800 mb-6">Segmentación</h2>
      <div className="grid grid-cols-2 gap-4">
        {segmentationFormSchema.map(renderField)}
      </div>
    </div>
  );
};

