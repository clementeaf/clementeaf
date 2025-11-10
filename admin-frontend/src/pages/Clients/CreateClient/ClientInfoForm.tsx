import { useState, useEffect } from 'react';
import { Input } from '../../../components/commons';
import { clientInfoFormSchema, type FormField } from './ClientInfoForm.schema';

/**
 * Props del componente ClientInfoForm
 */
interface ClientInfoFormProps {
  /**
   * Función para actualizar los datos del formulario
   */
  onDataChange?: (data: Record<string, string>) => void;
  /**
   * Datos iniciales del formulario
   */
  initialData?: Record<string, string>;
}

/**
 * Componente Formulario de información del cliente (Paso 1)
 * @param props - Props del componente ClientInfoForm
 * @returns Componente ClientInfoForm
 */
export const ClientInfoForm = ({ onDataChange, initialData }: ClientInfoFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || 
    clientInfoFormSchema.reduce((acc, field) => {
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
        // Solo actualizar si hay diferencias para evitar loops infinitos
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
    const field = clientInfoFormSchema.find(f => f.name === fieldName);
    if (field?.validate) {
      const error = field.validate(value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    } else {
      // Limpiar error si no hay validación personalizada
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
  const renderField = (field: FormField): React.ReactNode => {
    const hasCustomElement = !!field.customElement;
    const label = field.optional ? `${field.label} (opcional)` : field.label;
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : 'col-span-1';

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
      <h2 className="text-lg font-bold text-gray-800 mb-6">Información del cliente</h2>
      <div className="grid grid-cols-2 gap-4">
        {clientInfoFormSchema.map(renderField)}
      </div>
    </div>
  );
};

